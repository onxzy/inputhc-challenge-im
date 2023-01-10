module.exports = {
  'env': {
    'commonjs': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'rules': {
    'max-len': ['error', {'code': 200}],
    'new-cap': 0,
    'indent': ['error', 2],
    'require-jsdoc': 'off',
    'operator-linebreak': [
      'error',
      'after', {
        'overrides': {'?': 'before', ':': 'before'},
      },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'semi': [
      'error',
      'always',
    ],
  },
};
