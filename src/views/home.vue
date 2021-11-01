<template>
	<div class="home">
		<button @click="handleClick">测试webworker</button>
	</div>
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import {
	DEFAULT_WORKER_COUNT,
	DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
	WORKER_SERVICE_MANAGER_SERVICE_ID,
	Requests,
} from '@/worker/serviceProtocol'

import { ConcurrentWorkerSet } from '@/worker/ConcurrentWorkerSet'
import { DEFAULT_WORKER_SCRIPT_URL } from '@/worker/serviceProtocol'
import { AvailableServiceType } from '@/worker'
let u =
	'http://101.34.72.114:8330/api/sys/house/queryList?pageNum=1&pageSize=99999&startTime=2019-10-10%2010%3A10%3A10'
export default defineComponent({
	name: 'home',
	setup(props, { slots, emit }) {
		const a: { str: string } = {
			str: '',
		}

		const workerSet = new ConcurrentWorkerSet({
			scriptUrl: DEFAULT_WORKER_SCRIPT_URL,
			workerCount: DEFAULT_WORKER_COUNT,
			workerConnectionTimeout: DEFAULT_WORKER_INITIALIZATION_TIMEOUT,
		})
		workerSet.connect(WORKER_SERVICE_MANAGER_SERVICE_ID).then(res => {
			workerSet.broadcastRequest(WORKER_SERVICE_MANAGER_SERVICE_ID, {
				type: Requests.CreateService,
				targetServiceType: AvailableServiceType.AXIOS,
				targetServiceId: 'axios-service-1',
			})
		})
		const handleClick = () => {
			workerSet
				.invokeRequest('axios-service-1', {
					type: 'get',
					url: u,
				} as any)
				.then(res2 => {
					console.log('axios-service-1 response:', res2)
				})
		}
		return { handleClick }
	},
})
</script>
<style lang="scss" scoped>
.home {
}
</style>