const { merge } = require("webpack-merge");
const baseWebpackConfig = require("./base.config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("./index");
const webpack = require("webpack");

const devWebpackConfig = merge(baseWebpackConfig, {
	devtool: "source-map",
	devServer: {
		compress: true,
		port: 8089,
	},
	optimization: {
		noEmitOnErrors: true, //当webpack编译错误的时候，来中端打包进程，防止错误代码打包到文件中
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: '"development"',
				BASE_URL: '""',
			},
		}),
		new HtmlWebpackPlugin({
			//输出文件名
			filename: "index.html",
			//生成html参考的模板
			template: resolve("./public/index.ejs"),
			//防止报BASE_URL找不到的错误
			templateParameters: {
				BASE_URL: resolve("/"),
			},
			title: "webpack5配置vue3开发环境测试",
			inject: "body",
		}),
	],
});
module.exports = devWebpackConfig;
