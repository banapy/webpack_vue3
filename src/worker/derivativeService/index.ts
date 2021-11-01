import { RequestService } from '@/worker/derivativeService/requestService'
import {
	DEFAULT_WORKER_COUNT,
	DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	WORKER_SERVICE_MANAGER_SERVICE_ID,
	Requests,
} from '@/worker/serviceProtocol'

import { ConcurrentWorkerSet } from '@/worker/ConcurrentWorkerSet'
import { DEFAULT_WORKER_SCRIPT_URL } from '@/worker/serviceProtocol'
export async function connect() {
	const workerSet = new ConcurrentWorkerSet({
		scriptUrl: DEFAULT_WORKER_SCRIPT_URL,
		workerCount: DEFAULT_WORKER_COUNT,
		workerConnectionTimeout: DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	})
	let requestService = new RequestService(workerSet)
	await Promise.all([requestService.connect()])
	return { requestService }
}
