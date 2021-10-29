const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseWebpackConfig = require('./prod.config.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { resolve } = require('./index.js')
const webpackConfig = merge(baseWebpackConfig, {
	devtool: false,
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: 'production',
				BASE_URL: '',
			},
		}),
		new UglifyJsPlugin({
			uglifyOptions: {
				compress: {
					//压缩
					warnings: true, //警告：true保留警告，false不保留
				},
			},
			sourceMap: false,
			parallel: true,
		}),
		// new ExtractTextPlugin({
		// 	//抽取文本。比如打包之后的index页面有style插入，就是这个插件抽取出来的，减少请求
		// 	filename: 'css/[name].[contenthash].css',
		// 	allChunks: true,
		// }),

		new OptimizeCSSPlugin({
			//优化css的插件
			cssProcessorOptions: { safe: true, map: { inline: false } },
		}),

		new HtmlWebpackPlugin({
			//html打包
			filename: 'index.html',
			template: './public/index.ejs',
			templateParameters: {
				BASE_URL: '/',
			},
			title: 'webpack5配置vue3开发环境测试',
			inject: 'body',
			minify: {
				//压缩
				removeComments: true, //删除注释
				collapseWhitespace: true, //删除空格
				removeAttributeQuotes: true, //删除属性的引号
			},

			chunksSortMode: 'dependency', //模块排序，按照我们需要的顺序排序
		}),

		new webpack.optimize.ModuleConcatenationPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				//复制，比如打包完之后需要把打包的文件复制到dist里面
				{
					from: path.resolve(__dirname, 'assets'),
					to: resolve('assets'),
					toType: 'dir',
				},
			],
		}),
		new BundleAnalyzerPlugin(),
	],
})
module.exports = webpackConfig
