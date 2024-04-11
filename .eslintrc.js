module.exports = {
  root: true,
  env:  {
    es6:  true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser:        '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion:   2021,
    parser:        '@typescript-eslint/parser',
    sourceType:    'module',
    impliedStrict: true,
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'no-unused-vars':              0,
    'complexity':                  ['error', 15],
    eqeqeq:                        ['error', 'always'],
    'no-var':                      2,
    'prefer-spread':               2,
    'prefer-template':             2,
    'no-duplicate-imports':        1,
    'prefer-rest-params':          2,
    'prefer-arrow-callback':       2,
    'no-const-assign':             2,
    'no-multiple-empty-lines':     2,
  },
};
