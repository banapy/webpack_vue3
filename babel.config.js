module.exports = {
	// 另外还需要注意presets的加载顺序是倒叙的。
	presets: [
		[
			//智能转换成目标运行环境代码
			"@babel/preset-env",
			{
				useBuiltIns: "usage", // 按需引入 polyfill
				corejs: 3,
				targets: {
					chrome: 67,
					edge: 17,
					firefox: 60,
					safari: 11.1,
				},
			},
		],
		[
			//解析 typescript 的 babel 预设
			"@babel/preset-typescript", // 引用Typescript插件
			{
				allExtensions: true, // 支持所有文件扩展名，否则在vue文件中使用ts会报错
			},
		],
		"@vue/cli-plugin-babel/preset",
	],
	plugins: [
		[
			"@babel/plugin-transform-runtime",
			{
				corejs: 3,
			},
		],
		//支持 ts 类的写法
		"@babel/proposal-class-properties",
		//支持三点展开符
		"@babel/proposal-object-rest-spread",
	],
};
