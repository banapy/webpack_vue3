import axios from 'axios'
import qs from 'qs'
import { AvailableServiceType } from '@/worker/base'
import { new_eval } from '@/worker/base/utils'
import {
	WorkerService,
	WorkerServiceResponse,
} from '@/worker/base/WorkerService'
import { WorkerServiceManager } from '@/worker/base/WorkerServiceManager'
namespace Protocol {
	function isGetMethod(request) {}
}
let instance = axios.create({
	baseURL: '', //接口统一域名
	timeout: 12000, //设置超时
})
export interface GetRequest {
	type: 'get'
	url: string
	params?: object
	cb?: string
}
export interface PostRequest {
	type: 'post'
	url: string
	formData?: object
	cb?: string
}
export type AxiosServiceRequest = GetRequest | PostRequest
export class AxiosService extends WorkerService {
	private static _axiosServiceCount = 0

	static start() {
		// const _serviceId = AvailableServiceType.AXIOS + AxiosService._axiosServiceCount++
		WorkerServiceManager.getInstance().register({
			serviceType: AvailableServiceType.AXIOS,
			factory: serviceId => new AxiosService(serviceId),
		})
	}
	constructor(readonly serviceId: string) {
		super(serviceId)
	}
	protected async handleRequest(
		request: AxiosServiceRequest
	): Promise<WorkerServiceResponse> {
		console.log('axios-service request:', request)
		switch (request.type) {
			case 'get':
				let getRes = await instance({
					url: request.url,
					method: 'get',
					params: request.params,
					paramsSerializer: (params: any) => {
						return qs.stringify(params, { indices: false })
					},
				})
				if (request.cb) {
					getRes.data = new_eval(request.cb)(getRes.data)
				}
				return { response: getRes.data }
			case 'post':
				const postRes = await instance({
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					url: request.url,
					method: 'POST',
					transformRequest: [
						function (data: { [x: string]: string | Blob }, headers: any) {
							const formData = new FormData()
							for (const key of Object.keys(data)) {
								formData.append(key, data[key])
							}
							return formData
						},
					],
					data: request.formData,
				})
				if (request.cb) {
					postRes.data = new_eval(request.cb)(postRes.data)
				}
				return { response: postRes.data }
			default:
				console.error(`${this.serviceId}:暂不支持请求的类型`)
				break
		}
	}
}
