const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const { resolve } = require("./index");

const baseConfig = {
	mode: "development",
	entry: resolve("./src/main.ts"),
	context: __dirname,
	output: {
		filename: "js/[name].bundle.js",
		chunkFilename: "js/[name].chunk.js",
		clean: true,
		path: resolve("dist"),
	},
	resolve: {
		//./src/views/home.vue可写成@/viwes/home.vue
		alias: {
			"@": resolve("src"),
		},
		//自动的扩展后缀，比如一个js文件，则引用时书写可不要写.js
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
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 10000,
							// name: utils.assetsPath("img/[name].[hash:7].[ext]"),
						},
					},
				],
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 10000,
							// name: utils.assetsPath("img/[name].[hash:7].[ext]"),
						},
					},
				],
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: "url-loader",
				options: {
					limit: 10000,
					// name: utils.assetsPath("fonts/[name].[hash:7].[ext]"),
				},
			},
		],
	},
	devServer: {
		compress: true,
		port: 8089,
	},
	target: "web",
	plugins: [
		new VueLoaderPlugin(),
		new CopyPlugin({
			patterns: [
				{
					from: resolve("public"),
					to: resolve("dist"),
					toType: "dir",
				},
			],
		}),
	],
};
const workerConfig = {
	context: __dirname,
	devtool: "source-map",
	resolve: {
		extensions: [".webpack.js", ".web.ts", ".ts", ".tsx", ".web.js", ".js"],
		alias: {
			"react-native": "react-native-web",
		},
		fallback: {
			fs: false,
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
				options: {
					configFile: path.join(process.cwd(), "tsconfig.json"),
					onlyCompileBundledFiles: true,
					transpileOnly: false,
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
		path: path.join(process.cwd(), "..", "dist/examples"),
		filename: "[name].bundle.js",
	},
	performance: {
		hints: false,
	},
	stats: {
		all: false,
		timings: true,
		exclude: "resources/",
		errors: true,
		entrypoints: true,
		warnings: true,
	},
	mode: "development",
	target: "webworker",
	entry: {
		decoder: resolve("./src/worker/index.ts"),
	},
};
module.exports = baseConfig;