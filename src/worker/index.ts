import axios from 'axios'
onmessage = evt => {
	console.log('worker receive message:', evt.data)
	let u =
		'http://101.34.72.114:8330/api/sys/house/queryList?pageNum=1&pageSize=99999&startTime=2019-10-10%2010%3A10%3A10'
	axios.get(u).then(res => {
		console.log('worker request data:', res)
	})
}
