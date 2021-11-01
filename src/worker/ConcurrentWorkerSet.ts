import {
	ReadyPromise,
	RequestEntry,
	WorkerRequestEntry,
	ConcurrentWorkerSetOptions,
	DEFAULT_WORKER_COUNT,
	DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	WorkerEntry,
	isResponseMessage,
	isInitializedMessage,
	ServiceRequest,
	RequestController,
	RequestMessage,
	ServiceMessageName,
	WorkerServiceManagerRequest,
} from './serviceProtocol'
import { WorkerLoader } from './WorkerLoader'
import { getOptionValue } from './OptionsUtils'

export class ConcurrentWorkerSet {
	private readonly _eventListeners = new Map<string, (message: any) => void>()
	private _workers = new Array<Worker>()

	// List of idle workers that can be given the next job. It is using a LIFO scheme to reduce
	// memory consumption in idle workers.
	private _availableWorkers = new Array<Worker>()
	private _workerPromises = new Array<Promise<WorkerEntry | undefined>>()
	private _workerCount: number | undefined

	private readonly _readyPromises = new Map<string, ReadyPromise>()
	private readonly _requests: Map<number, RequestEntry> = new Map()
	private _workerRequestQueue: WorkerRequestEntry[] = []

	private _nextMessageId: number = 0
	private _stopped: boolean = true

	private _referenceCount: number = 0

	/**
	 * Creates a new `ConcurrentWorkerSet`.
	 *
	 * Creates as many Web Workers as specified in `options.workerCount`, from the script provided
	 * in `options.scriptUrl`. If `options.workerCount` is not specified, the value specified in
	 * `navigator.hardwareConcurrency` is used instead.
	 *
	 * The worker set is implicitly started when constructed.
	 */
	constructor(private _options: ConcurrentWorkerSetOptions) {
		this.start(_options)
	}

	/**
	 * Adds an external reference and increments the internal reference counter by one.
	 *
	 * To implement a reference-count based automatic resource cleanup, use this function with
	 * [[removeReference]].
	 */
	addReference() {
		this._referenceCount += 1
		if (this._referenceCount === 1 && this._stopped) {
			this.start()
		}
	}

	/**
	 * Decrements the internal reference counter by 1.
	 *
	 * When the internal reference counter reaches 0, this function calls [[dispose]] to clear the
	 * resources.
	 *
	 * Use with [[addReference]] to implement reference-count based automatic resource cleanup.
	 */
	removeReference() {
		this._referenceCount -= 1
		if (this._referenceCount === 0) {
			this.destroy()
		}
	}

	/**
	 * Starts workers.
	 *
	 * Use to start workers already stopped by [[stop]] or [[destroy]] calls.
	 *
	 * Note: The worker set is implicitly started on construction - no need to call [[start]] on
	 * fresh instance.
	 *
	 * @param options - optional, new worker set options
	 */
	start(options?: ConcurrentWorkerSetOptions) {
		if (options !== undefined) {
			this._options = options
		}
		if (!this._stopped) {
			throw new Error('ConcurrentWorker set already started')
		}

		this._workerCount = getOptionValue(
			this._options.workerCount,
			DEFAULT_WORKER_COUNT
		)

		// Initialize the workers. The workers now have an ID to identify specific workers and
		// handle their busy state.
		const timeout = getOptionValue(
			this._options.workerConnectionTimeout,
			DEFAULT_WORKER_INITIALIZATION_TIMEOUT
		)
		for (let workerId = 0; workerId < this._workerCount; ++workerId) {
			const workerPromise = WorkerLoader.startWorker(
				this._options.scriptUrl,
				timeout
			).then(worker => {
				const listener = (evt: Event): void => {
					this.onWorkerMessage(workerId, evt as MessageEvent)
				}

				worker.addEventListener('message', listener)
				this._workers.push(worker)
				this._availableWorkers.push(worker)
				return {
					worker,
					listener,
				}
			})
			this._workerPromises.push(workerPromise)
		}
		this._stopped = false
	}

	/**
	 * The number of workers started for this worker set. The value is `undefined` until the workers
	 * have been created.
	 */
	get workerCount(): number | undefined {
		return this._workerCount
	}

	/**
	 * Stops workers.
	 *
	 * Waits for all pending requests to be finished and stops all workers.
	 *
	 * Use [[start]] to start this worker again.
	 *
	 * @returns `Promise` that resolves when all workers are destroyed.
	 */
	async stop() {
		this._stopped = true

		await this.waitForAllResponses().then(() => {
			this.terminateWorkers()
		})
	}

	/**
	 * Destroys all workers immediately.
	 *
	 * Resolves all pending request promises with a `worker destroyed` error.
	 *
	 * Use [[start]] to start this worker again.
	 */
	destroy() {
		this._stopped = true

		// respond with all pending request
		this._requests.forEach(entry => {
			entry.resolver(new Error('worker destroyed'))
		})
		this._requests.clear()
		this._workerRequestQueue = []

		this.terminateWorkers()

		// clean other stuff
		this._eventListeners.clear()
	}

	/**
	 * Is `true` if the workers have been terminated.
	 */
	get terminated(): boolean {
		return this._workers.length === 0
	}

	/**
	 * Waits for `service` to be initialized in all workers.
	 *
	 * Each service that starts in a worker sends an [[isInitializedMessage]] to confirm that
	 * it has started successfully. This method resolves when all workers in a set have
	 * `service` initialized.
	 *
	 * Promise is rejected if any of worker fails to start.
	 *
	 * @param serviceId - The service identifier.
	 */
	async connect(serviceId: string): Promise<void> {
		this.ensureStarted()
		await Promise.all(this._workerPromises)
		return await this.getReadyPromise(serviceId).promise
	}

	/**
	 * Registers an event listener for events that originated in a web worker, for a given
	 * `serviceId`. You can only set one event listener per `serviceId`.
	 *
	 * @param serviceId - The service to listen to.
	 * @param callback - The callback to invoke for matching events.
	 */
	addEventListener(serviceId: string, callback: (message: any) => void) {
		this._eventListeners.set(serviceId, callback)
	}

	/**
	 * Removes a previously set event listener for the given `serviceId`.
	 *
	 * @param serviceId - The service from which to remove the event listeners.
	 */
	removeEventListener(serviceId: string) {
		this._eventListeners.delete(serviceId)
	}

	/**
	 * Invokes a request that expects a response from a random worker.
	 *
	 * Sends [[RequestMessage]] and resolves when a matching [[ResponseMessage]] is received from
	 * workers. Use this function when interfacing with "RPC-like" calls to services.
	 *
	 * @param serviceId - The name of service, as registered with the [[WorkerClient]] instance.
	 * @param request - The request to process.
	 * @param transferList - An optional array of `ArrayBuffer`s to transfer to the worker context.
	 * @param requestController - An optional [[RequestController]] to store state of cancelling.
	 *
	 * @returns A `Promise` that resolves with a response from the service.
	 */
	invokeRequest<Res>(
		serviceId: string,
		request: ServiceRequest,
		transferList?: ArrayBuffer[],
		requestController?: RequestController
	): Promise<Res> {
		this.ensureStarted()

		const messageId = this._nextMessageId++
		let resolver: ((error?: any, response?: any) => void) | undefined

		const promise = new Promise<Res>((resolve, reject) => {
			resolver = (error?: Error, response?: Res) => {
				this._requests.delete(messageId)

				if (error !== undefined) {
					reject(error)
				} else {
					resolve(response as Res)
				}
			}
		})
		this._requests.set(messageId, {
			promise,
			resolver: resolver!,
		})

		const message: RequestMessage = {
			service: serviceId,
			type: ServiceMessageName.Request,
			messageId,
			request,
		}
		this.postRequestMessage(message, transferList, requestController)
		return promise
	}

	/**
	 * Invokes a request that expects responses from all workers.
	 *
	 * Send [[RequestMessage]]  to all workers and resolves when all workers have sent a matching
	 * [[ResponseMessage]]. Use this function to wait on request that need to happen on all workers
	 * before proceeding (like synchronous worker service creation).
	 *
	 * @param serviceId - The name of service, as registered with the [[WorkerClient]] instance.
	 * @param request - The request to process.
	 * @param transferList - An optional array of `ArrayBuffer`s to transfer to the worker context.
	 *
	 * @returns Array of `Promise`s that resolves with a response from each worker (unspecified
	 * order).
	 */
	broadcastRequest<Res>(
		serviceId: string,
		request: WorkerServiceManagerRequest | ServiceRequest,
		transferList?: ArrayBuffer[]
	): Promise<Res[]> {
		const promises = []
		for (const worker of this._workers) {
			const messageId = this._nextMessageId++

			let resolver: ((error?: any, response?: any) => void) | undefined
			const promise = new Promise<Res>((resolve, reject) => {
				resolver = (error: Error, response: Res) => {
					this._requests.delete(messageId)

					if (error !== undefined) {
						reject(error)
					} else {
						resolve(response as Res)
					}
				}
			})
			promises.push(promise)

			this._requests.set(messageId, {
				promise,
				resolver: resolver!,
			})

			const message: RequestMessage = {
				service: serviceId,
				type: ServiceMessageName.Request,
				messageId,
				request,
			}
			if (transferList !== undefined) {
				worker.postMessage(message, transferList)
			} else {
				worker.postMessage(message)
			}
		}

		return Promise.all(promises)
	}

	/**
	 * Posts a message to all workers.
	 *
	 * @param message - The message to send.
	 * @param buffers - Optional buffers to transfer to the workers.
	 */
	broadcastMessage(message: any, buffers?: ArrayBuffer[] | undefined) {
		this.ensureStarted()

		if (buffers !== undefined) {
			this._workers.forEach(worker => worker.postMessage(message, buffers))
		} else {
			this._workers.forEach(worker => worker.postMessage(message))
		}
	}

	/**
	 * The size of the request queue for debugging and profiling.
	 */
	get requestQueueSize() {
		return this._workerRequestQueue.length
	}

	/**
	 * The number of workers for debugging and profiling.
	 */
	get numWorkers() {
		return this._workers.length
	}

	/**
	 * The number of workers for debugging and profiling.
	 */
	get numIdleWorkers() {
		return this._availableWorkers.length
	}

	/**
	 * Subclasses must call this function when a worker emits an event.
	 *
	 * @param event - The event to dispatch.
	 */
	protected eventHandler(event: any) {
		if (typeof event.data.type !== 'string') {
			return // not an event generated by us, ignore.
		}

		this.dispatchEvent(event.data.type, event)
	}

	/**
	 * Handles messages received from workers. This method is protected so that the message
	 * reception can be simulated through an extended class, to avoid relying on real workers.
	 *
	 * @param workerId - The workerId of the web worker.
	 * @param event - The event to dispatch.
	 */
	private readonly onWorkerMessage = (
		workerId: number,
		event: MessageEvent
	) => {
		if (isResponseMessage(event.data)) {
			const response = event.data
			if (response.messageId === null) {
				console.error(
					`[${this._options.scriptUrl}]: Bad ResponseMessage: no messageId`
				)
				return
			}
			const entry = this._requests.get(response.messageId)
			if (entry === undefined) {
				console.error(
					`[${this._options.scriptUrl}]: Bad ResponseMessage: invalid messageId`
				)
				return
			}

			if (workerId >= 0 && workerId < this._workers.length) {
				const worker = this._workers[workerId]
				this._availableWorkers.push(worker)
				// Check if any new work has been put into the queue.
				this.checkWorkerRequestQueue()
			} else {
				console.error(
					`[${this._options.scriptUrl}]: onWorkerMessage: invalid workerId`
				)
			}
			if (response.errorMessage !== undefined) {
				const error = new Error(response.errorMessage)
				if (response.errorStack !== undefined) {
					error.stack = response.errorStack
				}
				entry.resolver(error)
			} else {
				entry.resolver(undefined, response.response)
			}
		} else if (isInitializedMessage(event.data)) {
			const readyPromise = this.getReadyPromise(event.data.service)
			if (++readyPromise.count === this._workerPromises.length) {
				readyPromise.resolve()
			}
		} else {
			this.eventHandler(event)
		}
	}

	/**
	 * 将消息发送给可用的worker，如果没有可用的，则入等待队
	 *
	 * @param message - The message to send.
	 * @param buffers - Optional buffers to transfer to the worker.
	 * @param requestController - An optional [[RequestController]] to store state of cancelling.
	 */
	private postRequestMessage(
		message: RequestMessage,
		buffers?: ArrayBuffer[] | undefined,
		requestController?: RequestController
	) {
		this.ensureStarted()
		if (this._workers.length === 0) {
			throw new Error('ConcurrentWorkerSet#postMessage: no workers started')
		}

		// Check if the requestController has received the abort signal, in which case the request
		// is ignored.
		if (requestController !== undefined && requestController.signal.aborted) {
			const entry = this._requests.get(message.messageId)
			if (entry === undefined) {
				console.error(
					`[${this._options.scriptUrl}]: Bad RequestMessage: invalid messageId`
				)
				return
			}

			const err = new Error('Aborted')
			err.name = 'AbortError'

			entry.resolver(err, undefined)
			return
		}

		if (this._availableWorkers.length > 0) {
			const worker = this._availableWorkers.pop()!

			if (buffers !== undefined) {
				worker.postMessage(message, buffers)
			} else {
				worker.postMessage(message)
			}
		} else {
			// We need a priority to keep sorting stable, so we have to add a RequestController.
			if (requestController === undefined) {
				requestController = new RequestController(0)
			}
			if (requestController.priority === 0) {
				// If the requests do not get a priority, they should keep their sorting order.
				requestController.priority = -this._nextMessageId
			}
			this._workerRequestQueue.unshift({
				message,
				buffers,
				requestController,
			})
		}
	}

	private ensureStarted() {
		if (this._stopped) {
			throw new Error('ConcurrentWorkerSet stopped')
		}
	}

	private async waitForAllResponses(): Promise<any> {
		const promises = new Array<Promise<void>>()
		this._requests.forEach(entry => {
			promises.push(entry.promise)
		})
		await Promise.all(promises)
	}

	private dispatchEvent(id: string, message: any) {
		const callback = this._eventListeners.get(id)
		if (callback === undefined) {
			return
		} // unknown event, ignore.
		callback(message)
	}

	//中断所有worker
	private terminateWorkers() {
		// terminate all workers
		this._workerPromises.forEach(workerPromise => {
			workerPromise.then(workerEntry => {
				if (workerEntry === undefined) {
					return
				}
				workerEntry.worker.removeEventListener('message', workerEntry.listener)
				workerEntry.worker.terminate()
			})
		})
		this._workers = []
		this._workerPromises = []
		this._availableWorkers = []
		this._readyPromises.clear()
	}

	private getReadyPromise(id: string): ReadyPromise {
		const readyPromise = this._readyPromises.get(id)
		if (readyPromise !== undefined) {
			return readyPromise
		}

		const newPromise: ReadyPromise = {
			count: 0,
			promise: undefined,
			resolve: () => {
				/* placeholder */
			},
			reject: (error: any) => {
				newPromise.error = error
			},
			error: undefined,
		}

		newPromise.promise = new Promise<void>((resolve, reject) => {
			const that = newPromise

			if (that.error !== undefined) {
				reject(that.error)
			} else if (that.count === this._workerPromises.length) {
				resolve()
			}

			that.resolve = resolve
			that.reject = reject
		})

		this._readyPromises.set(id, newPromise)
		return newPromise
	}
	/**
	 * 检查worker请求队列，如果有合适的worker则执行postRequestMessage，先按优先级排序队列中的请求，优先处理高优先级的请求
	 *
	 */
	private checkWorkerRequestQueue() {
		if (
			this._workerRequestQueue.length === 0 ||
			this._availableWorkers.length === 0
		) {
			return
		}
		this._workerRequestQueue.sort(
			(a: WorkerRequestEntry, b: WorkerRequestEntry) => {
				return a.requestController!.priority - b.requestController!.priority
			}
		)

		// Get the request with the highest priority and send it (again).
		while (
			this._availableWorkers.length > 0 &&
			this._workerRequestQueue.length > 0
		) {
			const request = this._workerRequestQueue.pop()!
			this.postRequestMessage(
				request.message,
				request.buffers,
				request.requestController
			)
		}
	}
}
