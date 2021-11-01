export const DEFAULT_WORKER_COUNT = 1
export const DEFAULT_WORKER_INITIALIZATION_TIMEOUT = 10000
export const DEFAULT_WORKER_SCRIPT_URL = 'decoder.bundle.js'
export const WORKER_SERVICE_MANAGER_SERVICE_ID = 'worker-service-manager'

export interface ReadyPromise {
	count: number
	promise?: Promise<void>
	resolve: () => void
	reject: (reason: any) => void
	error?: any
}
export interface RequestEntry {
	promise: Promise<any>
	resolver: (error?: Error, response?: object) => void
}
export enum ServiceMessageName {
	Initialized = 'initialized',
	Request = 'request',
	Response = 'response',
}
export interface ServiceMessage {
	service: string
	type: ServiceMessageName
}

/** 阻断控制器，阻断一个或多个请求 */
interface AbortController {
	/**
	 * Returns the AbortSignal object associated with this object.
	 */
	readonly signal: AbortSignal
	/**
	 * Invoking this method will set this object's AbortSignal's aborted flag and signal to any observers that the associated activity is to be aborted.
	 */
	abort(): void
}

declare var AbortController: {
	prototype: AbortController
	new (): AbortController
}
/**
 * Allows to cancel and prioritize requests inside the requestQueue.
 *
 * @remarks
 * Useful to optimize the order of decoding tiles during animations and camera movements.
 *
 * `RequestController` is not extending [[AbortController]], because this is not supported in ES5.
 */
export class RequestController implements AbortController {
	/**
	 * Creates an instance of `RequestController`.
	 *
	 * @param {number} priority
	 * @param {AbortController} abortController Optional [[AbortController]] used internally, since
	 *      [[AbortController]]s should not be subclassed.
	 */
	constructor(
		public priority: number = 0,
		public abortController: AbortController = new AbortController()
	) {
		this.priority = priority
		this.abortController = abortController
	}

	get signal(): AbortSignal {
		return this.abortController.signal
	}

	/**
	 * Invoking this method will set this object's AbortSignal's aborted flag and
	 * signal to any observers that the associated activity is to be aborted.
	 */
	abort(): void {
		this.abortController.abort()
	}
}
export interface WorkerRequestEntry {
	message: RequestMessage
	buffers?: ArrayBuffer[] | undefined
	requestController?: RequestController
}
export interface ConcurrentWorkerSetOptions {
	/**
	 * The URL of the script for each worker to start.
	 */
	scriptUrl: string

	/**
	 * The number of Web Workers for processing data.
	 *
	 * Defaults to CLAMP(`navigator.hardwareConcurrency` - 1, 1, 4) or [[DEFAULT_WORKER_COUNT]].
	 */
	workerCount?: number

	/**
	 * Timeout in milliseconds, in which each worker should set initial message.
	 *
	 * @default 10 seconds, see [[DEFAULT_WORKER_INITIALIZATION_TIMEOUT]]
	 */
	workerConnectionTimeout?: number
}
export interface WorkerEntry {
	worker: Worker
	listener: EventListener
}
export interface RequestMessage extends ServiceMessage {
	type: ServiceMessageName.Request
	messageId: number
	request: any
}
/**
 * Type guard to check if an object is a request message sent to a worker.
 */
export function isRequestMessage(message: any): message is RequestMessage {
	return (
		message &&
		typeof message.service === 'string' &&
		typeof message.type === 'string' &&
		message.type === ServiceMessageName.Request
	)
}
export interface ResponseMessage extends ServiceMessage {
	type: ServiceMessageName.Response
	messageId: number
	errorMessage?: string
	errorStack?: string
	response?: object
}
export function isResponseMessage(message: any): message is ResponseMessage {
	return (
		message &&
		typeof message.service === 'string' &&
		typeof message.type === 'string' &&
		message.type === ServiceMessageName.Response
	)
}
/**
 * This message is sent by the worker to the main thread. No data is sent. Receiving this
 * message confirms that the worker has started successfully.
 */
export interface InitializedMessage extends ServiceMessage {
	type: ServiceMessageName.Initialized
}

/**
 * Type guard to check if an object is a signal message from worker.
 */
export function isInitializedMessage(
	message: any
): message is InitializedMessage {
	return (
		message &&
		typeof message.service === 'string' &&
		typeof message.type === 'string' &&
		message.type === ServiceMessageName.Initialized
	)
}
export interface ServiceRequest {
	type: string
}
export interface CreateServiceRequest extends ServiceRequest {
	type: Requests.CreateService

	/**
	 * Type of service to be created.
	 *
	 * @see [[WorkerServiceManager.register]]
	 */
	targetServiceType: string

	/**
	 * The newly created service instance will be available under this id.
	 */
	targetServiceId?: string
}
export enum Requests {
	CreateService = 'create-service',
	DestroyService = 'destroy-service',
}
export function isUnknownServiceError(error: Error): boolean {
	return error.message.includes('unknown targetServiceType requested: ')
}

/**
 * This message is sent by the main thread to [[WorkerServiceManager]] to dynamically destroy a
 * service.
 */
export interface DestroyServiceRequest extends ServiceRequest {
	type: Requests.DestroyService

	/**
	 * Id of service to be destroyed.
	 */
	targetServiceId: string
}
export type WorkerServiceManagerRequest =
	| CreateServiceRequest
	| DestroyServiceRequest
