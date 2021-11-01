<template>
	<div class="home">
		<button @click="handleClick">测试webworker</button>
	</div>
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
import { connect } from '@/worker/derivativeService/index'
import { RequestService } from '@/worker/derivativeService/requestService'
let u =
	'http://101.34.72.114:8330/api/sys/house/queryList?pageNum=1&pageSize=99999&startTime=2019-10-10%2010%3A10%3A10'
export default defineComponent({
	name: 'home',
	setup(props, { slots, emit }) {
		const a: { str: string } = {
			str: '',
		}
		let requestService: RequestService
		connect().then(res => {
			requestService = res.requestService
		})

		const handleClick = () => {
			requestService.get(u).then(res => console.log(res))
		}
		return { handleClick }
	},
})
</script>
<style lang="scss" scoped>
.home {
}
</style>