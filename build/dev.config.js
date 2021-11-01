const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./base.config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('./index')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { workerConfig } = require('./base.config')
const path = require('path')
const devWebpackConfig = merge(baseWebpackConfig, {
	devtool: 'source-map',
	devServer: {
		compress: true,
		port: 8089,
	},
	optimization: {
		emitOnErrors: false, //当webpack编译错误的时候，来中端打包进程，防止错误代码打包到文件中
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"development"',
				BASE_URL: '""',
			},
		}),
		new HtmlWebpackPlugin({
			//输出文件名
			filename: 'index.html',
			//生成html参考的模板
			template: resolve('./public/index.ejs'),
			//防止报BASE_URL找不到的错误
			templateParameters: {
				BASE_URL: resolve('/'),
			},
			title: 'webpack5配置vue3开发环境测试',
			inject: 'body',
		}),
		//babel转移typescript,ForkTsCheckerWebpackPlugin检查ts类型错误，在调试台打印出错误
		new ForkTsCheckerWebpackPlugin({
			typescript: {
				extensions: {
					vue: {
						enabled: true,
						compiler: '@vue/compiler-sfc',
					},
				},
				diagnosticOptions: {
					semantic: true,
					syntactic: false,
				},
			},
		}),
	],
})
exports.workerConfig = {
	target: 'webworker',
	context: __dirname,
	devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.ts'],
		alias: {
			'@': resolve('src'),
		},
		fallback: {
			fs: false,
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					configFile: path.join(process.cwd(), 'tsconfig.json'),
					onlyCompileBundledFiles: true,
					transpileOnly: true, //关闭类型检查，即只进行转译
					projectReferences: true,
					compilerOptions: {
						sourceMap: !false,
						declaration: false,
					},
				},
			},
		],
	},
	output: {
		path: path.join(process.cwd(), '..', 'dist/examples'),
		filename: '[name].bundle.js',
	},
	performance: {
		hints: false,
	},
	stats: {
		all: false,
		timings: true,
		exclude: 'resources/',
		errors: true,
		entrypoints: true,
		warnings: true,
	},
	mode: 'development',
	entry: {
		decoder: resolve('./src/worker/index.ts'),
	},
}
module.exports = [
	devWebpackConfig,
	{
		target: 'webworker',
		context: __dirname,
		devtool: 'source-map',
		resolve: {
			extensions: ['.js', '.ts'],
			alias: {
				'@': resolve('src'),
			},
			fallback: {
				fs: false,
			},
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					exclude: /node_modules/,
					options: {
						configFile: path.join(process.cwd(), 'tsconfig.json'),
						onlyCompileBundledFiles: true,
						transpileOnly: true, //关闭类型检查，即只进行转译
						projectReferences: true,
						compilerOptions: {
							sourceMap: !false,
							declaration: false,
						},
					},
				},
			],
		},
		output: {
			path: path.join(process.cwd(), '..', 'dist/examples'),
			filename: '[name].bundle.js',
		},
		performance: {
			hints: false,
		},
		stats: {
			all: false,
			timings: true,
			exclude: 'resources/',
			errors: true,
			entrypoints: true,
			warnings: true,
		},
		mode: 'development',
		entry: {
			decoder: resolve('./src/worker/base/index.ts'),
		},
	},
]
