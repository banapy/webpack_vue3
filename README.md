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
6. 安装vue生态组件
```
yarn add vue@next vuex@next vue-router@next
```

7. 安装typescript相关插件
[知乎-webpack配置vue3](https://zhuanlan.zhihu.com/p/59023070)
```
//@babel/core=生成AST,遍历AST,生成对应版本的js
//@babel/preset-env,根据不同环境，打包不同的js
//@babel/preset-typescript 解析typescript的语法
//@babel/plugin-proposal-class-properties 支持typescript的类的写法
//@babel/plugin-proposal-object-rest-spread 支持typescript的三点展开符
yarn add @babel/core @babel/preset-env @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread @babel/plugin-transform-runtime @vue/cli-plugin-babel -D

yarn add @babel/runtime @babel/runtime-corejs3
```
tsconfig.json放在项目根目录下

8. [调整webpack配置](https://segmentfault.com/a/1190000014804826)