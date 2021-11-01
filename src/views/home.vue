<template>
	<div class="home">
		homehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehomehome
	</div>
</template>
<script lang='ts'>
import { defineComponent } from 'vue'
export default defineComponent({
	name: 'home',
	setup(props, { slots, emit }) {
		const a: { str: string } = {
			str: '',
		}
		const worker = new Worker('decoder.bundle.js')
		worker.onerror = e => console.error(e)
		worker.postMessage("something")
		return {}
	},
})
</script>
<style lang="scss" scoped>
.home {
}
</style>