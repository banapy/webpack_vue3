# webpack 搭建 vue3

1. 安装 webpack

```
//webpack和webpack-cli提供打包服务
//webpack-dev-server提供热更新服务
yarn add webpack webpack-cli webpack-dev-server webpack-merge-D
```

2. 安装样式的 loader

```
yarn add style-loader css-loader sass sass-loader -D
```

3. 安装其它文件的 loader

```
yarn add url-loader -D
```

4. 安装 vue 的 loader

```
//vue-loader@next加载.vue文件
//vue-template-es2015-compiler编译模板
yarn add vue-loader@next vue-template-es2015-compiler -D
```

5. 安装 webpack 插件

```
//html-webpack-plugin提取html到dist文件夹，并为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题
//copy-webpack-plugin赋值文件或文件夹，用于将public的静态文件直接拷贝到dist文件夹里
yarn add html-webpack-plugin copy-webpack-plugin -D

```

6. 安装 vue 生态组件

```
yarn add vue@next vuex@next vue-router@next
```

7. 安装 typescript 相关插件
   [知乎-webpack 配置 vue3](https://zhuanlan.zhihu.com/p/59023070)

```
//@babel/core=生成AST,遍历AST,生成对应版本的js
//@babel/preset-env,根据不同环境，打包不同的js
//@babel/preset-typescript 解析typescript的语法
//@babel/plugin-proposal-class-properties 支持typescript的类的写法
//@babel/plugin-proposal-object-rest-spread 支持typescript的三点展开符
yarn add @babel/core @babel/preset-env @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread @babel/plugin-transform-runtime @vue/cli-plugin-babel -D

yarn add @babel/runtime @babel/runtime-corejs3
```

tsconfig.json 放在项目根目录下

8. [调整 webpack 配置](https://segmentfault.com/a/1190000014804826)

9. 添加 typescript 类型检查

```
yarn add typescript ts-loader fork-ts-checker-webpack-plugin -D
```

10. 添加提交代码规范
    [commitlint](https://blog.csdn.net/qq_38290251/article/details/111646491)

```
yarn add inquirer shelljs -D
yarn add @commitlint/config-conventional @commitlint/cli -D
yarn add husky -D
```

11. 添加代码规范检查,代码写错时在调试台会有错误提示

```
yarn add eslint
//.eslintrc.js
module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
		// "@vue/prettier",//禁用vue-prettier
		'@vue/prettier/@typescript-eslint',
	],
	parserOptions: {
		ecmaVersion: 2020,
	},
	rules: {
		'no-var':"off",
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-undef': 'off', //未定义变量报错
		'no-case-declarations': 'off', //未定义变量报错
		'no-unused-vars': 'off',
		'no-inner-declarations': 'off',
		"no-mixed-spaces-and-tabs":"off",
		"no-prototypes-builtins":"off",
		"prefer-const": ["off", {
			"destructuring": "any",
			"ignoreReadBeforeAssign": false
		}],
		'@typescript-eslint/no-unused-vars': ['off'], //无用变量报错
		'vue/no-multiple-template-root': 'off', //多根组件提示错误
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'vue/no-unused-components': "off"
	},
}

```
