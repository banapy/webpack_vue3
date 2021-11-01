export enum AvailableServiceType {
	AXIOS = 'axios-service',
	FUNCTION = 'function-service',
}
import { AxiosService } from '@/worker/service/request/axios.worker'
import { FunctionService } from '@/worker/service/function/function.worker'
let ServiceList = [AxiosService, FunctionService]
ServiceList.forEach(s => s.start())
