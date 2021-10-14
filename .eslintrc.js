module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    impliedStrict: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'semi-spacing': [
      'error',
      {
        'before': false,
      },
    ],
    'no-trailing-spaces': 2,
    'space-before-function-paren': [2, 'always'],
    'spaced-comment': ['error', 'always'],
    'space-in-parens': ['error', 'never'],
    'switch-colon-spacing': ['error'],
    'no-unused-vars': 0,
    'comma-dangle': ['error', 'always=multiline'],
    'arror-parens': ['error', 'always'],
    'complexity': ['error', 15],
    eqeqeq: ['error', 'always'],
    'no-var': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'no-duplicate-imports': 1,
    'prefer-rest-params': 2,
    'prefer-arrow-callback' : 2,
    'no-const-assign': 2,
    'no-tabs': 2,
    'no-multiply-empty-lines': 2,
    'eol-last': ['error', 'always'],
    'key-spacing': [
      'error',
      {
        'align': {
          beforeColon: false,
          afterColon: true,
          on: 'value',
          mode: 'strict',
        },
      },
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'max-len': [
      0,
      {
        tabWidth: 2,
        code: 120,
        comments: 200,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'import/order': ['warn', { groups: ['index', 'sibling', 'parent', 'internal', 'external', 'builtin', 'object']}],
    'import/no-duplicates': ['warn', { considerQueryString: true }],
    'comma-spacing': ['warn', { before: false, after: true }],
  },
};