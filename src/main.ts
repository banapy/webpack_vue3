import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import { connect } from './worker/service'
createApp(App).use(router).use(store).mount('#app')
connect()
// let source = `"myvar">20&&"github"<40`;
// source = `()=>${source}`;
// //babel 核心库，用来实现核心转换引擎
// const babel = require("@babel/core");
// //类型判断，生成AST零部件
// const t = require("babel-types");
// let res2 = babel.transform(source, {
// 	plugins: [
// 		{
// 			visitor: {
// 				BinaryExpression(path) {
// 					if (path.node.left.type === "StringLiteral" && path.node.right.type === "NumericLiteral") {
// 						path.node.left = t.identifier("row." + path.node.left.value);
// 					} else if (path.node.left.type === "NumericLiteral" && path.node.right.type === "StringLiteral") {
// 						path.node.right = t.identifier("row." + path.node.right.value);
// 					}
// 				},
// 				ArrowFunctionExpression(path) {
// 					path.replaceWith(
// 						t.functionExpression(
// 							null,
// 							[t.identifier("row")],
// 							t.blockStatement([t.returnStatement(path.node.body)]),
// 							false,
// 							false
// 						)
// 					);
// 				},
// 			},
// 		},
// 	],
// });
// function new_eval(str) {
// 	return new Function("return " + str)();
// }
// let conditioner = new_eval(res2.code);
// console.log(conditioner);
// let pass = conditioner({ myvar: 10, github: 20 });
// console.log(pass);
