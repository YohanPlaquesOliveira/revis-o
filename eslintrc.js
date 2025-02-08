module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'warn',
    'security/detect-unsafe-regex': 'error'
  }
};