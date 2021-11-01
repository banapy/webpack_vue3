import { RequestService } from '@/worker/service/request/requestService'
import {
	DEFAULT_WORKER_COUNT,
	DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	WORKER_SERVICE_MANAGER_SERVICE_ID,
	Requests,
	DEFAULT_WORKER_SCRIPT_URL,
} from '@/worker/base/serviceProtocol'

import { ConcurrentWorkerSet } from '@/worker/base/ConcurrentWorkerSet'
let service
export async function connect() {
	if (service !== undefined) {
		return service
	}
	const workerSet = new ConcurrentWorkerSet({
		scriptUrl: DEFAULT_WORKER_SCRIPT_URL,
		workerCount: DEFAULT_WORKER_COUNT,
		workerConnectionTimeout: DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	})
	let requestService = new RequestService(workerSet)
	await Promise.all([requestService.connect()])
	service = { requestService }
	return service
}
