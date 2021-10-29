const path = require("path");
exports.resolve = function (dir) {
	//拼接出绝对路径
	// return path.resolve(__dirname, dir);
	return path.join(__dirname, "..", dir);
};