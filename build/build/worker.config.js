const path = require("path");
module.exports.workerConfig = {
	target: "webworker",
	entry: {
		decoder: path.resolve("./src/worker/index.ts"),
	},
	// context: __dirname,
	devtool: "source-map",
	resolve: {
		extensions: [".webpack.js", ".web.ts", ".ts", ".tsx", ".web.js", ".js"],
		alias: {
			"react-native": "react-native-web",
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
		// path:path.resolve("dist"),
		filename: "worker/[name].bundle.js",
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
	// @ts-ignore
	mode: process.env.NODE_ENV || "development",
};
