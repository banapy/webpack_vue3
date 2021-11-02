const { workerConfig } = require("./worker.config");
//增加对web worker的支持
console.log(workerConfig);
const workerCompiler = webpack(workerConfig);
const MultiCompiler = require("@vue/cli-service/node_modules/webpack/lib/MultiCompiler");
const multiCompiler = new MultiCompiler([compiler, workerCompiler]);