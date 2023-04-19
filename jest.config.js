const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: [
    'node_modules',
    './app/webpacker/src/javascripts',
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // Config for jest-fetch-mock
  automock: false,
  resetMocks: false,
  setupFilesAfterEnv: ['jest-fetch-mock'],

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    './app/webpacker/src/javascripts/tests',
  ],

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};

module.exports = config;
