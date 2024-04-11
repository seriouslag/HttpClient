module.exports = {
  verbose: true,
  roots:   [
    '<rootDir>/packages',
  ],
  preset:    'ts-jest',
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment:      'node',
  coverageProvider:     'v8',
  reporters:            ['jest-junit', 'default'],
  coverageReporters:    ['cobertura', 'html', 'lcov'],
  coverageDirectory:    'coverage',
  setupFiles:           ['./jest-setup.js'],
  collectCoverageFrom:  [
    'packages/**/*.{js,ts}',
    '!packages/httpclient/src/examples/**/*',
  ],
  testPathIgnorePatterns: ['/out/', '/node_modules/'],
  modulePaths:            [
    '<rootDir>/packages/',
  ],
  moduleNameMapper:       {
    '^@seriouslag/(.*)$': [
      '<rootDir>/packages/$1/src/',
    ],
  },
};
