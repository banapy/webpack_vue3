import axios from 'axios'
import qs from 'qs'
import { AvailableServiceType } from '.'
import { WorkerService, WorkerServiceResponse } from './WorkerService'
import { WorkerServiceManager } from './WorkerServiceManager'
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
}
export interface PostRequest {
	type: 'post'
	url: string
	formData?: object
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
				const getRes = await instance({
					url: request.url,
					method: 'get',
					params: request.params,
					paramsSerializer: (params: any) => {
						return qs.stringify(params, { indices: false })
					},
				})
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
				return { response: postRes.data }
			default:
				console.error(`${this.serviceId}:暂不支持请求的类型`)
				break
		}
	}
}
