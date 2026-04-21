/**
 * ESLint配置文件
 * 版本: v1.0.0.0
 * 说明: 配置ESLint规则
 */

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // 基本规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Vue规则
    'vue/no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    
    // 代码风格
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always']
  }
};
