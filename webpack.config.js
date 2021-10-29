const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const baseConfig = {
	mode: "development",
	entry: "./src/main.ts",
	output: {
		filename: "js/[name].bundle.js",
		chunkFilename: 'js/[name].chunk.js',
		clean: true,
		path: path.resolve(__dirname, "dist"),
	},
	devtool: false,
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		extensions: [".js", ".ts", "tsx", ".vue", ".json", ".vue"],
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "vue-loader",
					},
				],
			},
			{
				test: /\.(t|j)s$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
					},
				],
			},
			{
				test: /\.(css|scss)$/,
				use: [
					{
						loader: "style-loader",
					},
					{
						loader: "css-loader",
					},
					{
						loader: "sass-loader",
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/,
				type: "asset/resource",
			},
		],
	},
	devServer: {
		compress: true,
		port: 8089,
	},
	target: "web",
	plugins: [
		new HtmlWebpackPlugin({
			//输出文件名
			filename: "index.html",
			//生成html参考的模板
			template: "./public/index.ejs",
			//防止报BASE_URL找不到的错误
			templateParameters: {
				BASE_URL: "/",
			},
			title: "webpack5配置vue3开发环境测试",
			inject: "body",
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: '"development"',
				BASE_URL: '""',
			},
		}),
		new VueLoaderPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, "public"),
					to: path.resolve(__dirname, "dist"),
					toType: "dir",
				},
			],
		}),
	],
};

module.exports = [baseConfig];
