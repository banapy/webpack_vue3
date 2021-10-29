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
		'no-var': 'off',
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-undef': 'off', //未定义变量报错
		'no-case-declarations': 'off', //未定义变量报错
		'no-unused-vars': 'off',
		'no-inner-declarations': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'no-prototypes-builtins': 'off',
		'prefer-const': [
			'off',
			{
				destructuring: 'any',
				ignoreReadBeforeAssign: false,
			},
		],
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
		'vue/no-unused-components': 'off',
	},
}
