import { AvailableServiceType } from '@/worker/base'
import { new_eval } from '@/worker/base/utils'
import {
	WorkerService,
	WorkerServiceResponse,
} from '@/worker/base/WorkerService'
import { WorkerServiceManager } from '@/worker/base/WorkerServiceManager'

export class FunctionService extends WorkerService {
	private static _serviceCount = 0

	static start() {
		WorkerServiceManager.getInstance().register({
			serviceType: AvailableServiceType.FUNCTION,
			factory: serviceId => new FunctionService(serviceId),
		})
	}
	constructor(readonly serviceId: string) {
		super(serviceId)
	}
	protected async handleRequest(request: {
		func: string
		params: any[]
	}): Promise<WorkerServiceResponse> {
		return new_eval(request.func)(...request.params)
	}
}
