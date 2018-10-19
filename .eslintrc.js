module.exports = {
  'extends': 'airbnb',
  'env': {
    'jest': true
  },
  'rules': {
    'comma-dangle': 'off',
    'semi': 'off',
    'no-underscore-dangle': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
    'no-cond-assign': 'except-parens'
  }
}
