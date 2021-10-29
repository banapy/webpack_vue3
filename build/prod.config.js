const path = require("path");
const webpack = require("webpack");
const {merge} = require("webpack-merge");
const baseWebpackConfig = require("./prod.config.js");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const webpackConfig = merge(baseWebpackConfig, {
	module: {
		//调用utils.styleLoaders的方法
		rules: utils.styleLoaders({
			sourceMap: false, //开启调试的模式。默认为true
			extract: true,
			usePostCSS: true,
		}),
	},
	devtool: false,
	output: {
		path: config.build.assetsRoot,
		filename: utils.assetsPath("js/[name].[chunkhash].js"),
		chunkFilename: utils.assetsPath("js/[id].[chunkhash].js"),
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": env,
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
		new ExtractTextPlugin({
			//抽取文本。比如打包之后的index页面有style插入，就是这个插件抽取出来的，减少请求
			filename: utils.assetsPath("css/[name].[contenthash].css"),
			allChunks: true,
		}),

		new OptimizeCSSPlugin({
			//优化css的插件
			cssProcessorOptions: { safe: true, map: { inline: false } },
		}),

		new HtmlWebpackPlugin({
			//html打包
			filename: "index.html",
			template: "./public/index.ejs",
			templateParameters: {
				BASE_URL: "/",
			},
			title: "webpack5配置vue3开发环境测试",
			inject: "body",
			minify: {
				//压缩
				removeComments: true, //删除注释
				collapseWhitespace: true, //删除空格
				removeAttributeQuotes: true, //删除属性的引号
			},

			chunksSortMode: "dependency", //模块排序，按照我们需要的顺序排序
		}),

		new webpack.HashedModuleIdsPlugin(),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			//抽取公共的模块
			name: "vendor",
			minChunks(module) {
				return (
					module.resource &&
					/\.js$/.test(module.resource) &&
					module.resource.indexOf(path.join(__dirname, "../node_modules")) === 0
				);
			},
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "manifest",
			minChunks: Infinity,
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "app",
			async: "vendor-async",
			children: true,
			minChunks: 3,
		}),
		new CopyWebpackPlugin([
			//复制，比如打包完之后需要把打包的文件复制到dist里面
			{
				from: path.resolve(__dirname, "../static"),
				to: config.build.assetsSubDirectory,
				ignore: [".*"],
			},
		]),
	],
});

if (config.build.productionGzip) {
	const CompressionWebpackPlugin = require("compression-webpack-plugin");

	webpackConfig.plugins.push(
		new CompressionWebpackPlugin({
			asset: "[path].gz[query]",
			algorithm: "gzip",
			test: new RegExp(/\.(js|css)$/),
			threshold: 10240,
			minRatio: 0.8,
		})
	);
}

if (config.build.bundleAnalyzerReport) {
	const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
	webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
