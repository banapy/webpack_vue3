import { AvailableServiceType } from '@/worker/base'
import { AxiosServiceRequest } from '@/worker/service/request/axios.worker'
import { ConcurrentWorkerSet } from '@/worker/base/ConcurrentWorkerSet'
import {
	Requests,
	WORKER_SERVICE_MANAGER_SERVICE_ID,
} from '@/worker/base/serviceProtocol'
export class baseService {}
export class RequestService {
	private static nextUniqueServiceId = 0
	private readonly _serviceId: string
	private _serviceCreated = false
	private readonly serviceType = AvailableServiceType.AXIOS
	constructor(private readonly workerset: ConcurrentWorkerSet) {
		this.workerset = workerset
		this._serviceId = `${
			this.serviceType
		}-${RequestService.nextUniqueServiceId++}`
		this.workerset.addReference()
	}
	async connect(): Promise<void> {
		await this.workerset.connect(WORKER_SERVICE_MANAGER_SERVICE_ID)
		if (!this._serviceCreated) {
			await this.workerset.broadcastRequest(WORKER_SERVICE_MANAGER_SERVICE_ID, {
				type: Requests.CreateService,
				targetServiceType: this.serviceType,
				targetServiceId: this._serviceId,
			})
		}
		this._serviceCreated = true
	}
	get(url: string, params?: object, cb?: Function) {
		const message: AxiosServiceRequest = {
			type: 'get',
			url: url,
			params: params,
			cb: cb?.toString(),
		}
		return this.workerset.invokeRequest(this._serviceId, message)
	}
	post(url: string, formData?: object, cb?: Function) {
		let _formData = {}
		let transferList = []
		if (formData) {
			for (let key in formData) {
				if (formData instanceof File) {
					let arrayBuffer = formData.arrayBuffer()
					_formData[key] = arrayBuffer
					transferList.push(arrayBuffer)
				} else {
					_formData[key] = formData[key]
				}
			}
		}
		const message: AxiosServiceRequest = {
			type: 'post',
			url: url,
			formData: _formData,
			cb: cb?.toString(),
		}
		return this.workerset.invokeRequest(this._serviceId, message, transferList)
	}
}
