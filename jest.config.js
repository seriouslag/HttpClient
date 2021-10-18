module.exports = {
  verbose: true,
  roots:   [
    'src',
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
  modulePaths:          [
    '<rootDir>/src',
  ],
  testEnvironment:     'node',
  coverageProvider:    'v8',
  reporters:           ['jest-junit', 'default'],
  coverageReporters:   ['cobertura', 'html', 'lcov'],
  coverageDirectory:   'coverage',
  setupFiles:          ['./jest-setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/examples/**/*',
  ],
  testPathIgnorePatterns: ['/out/', '/node_modules/'],
};
