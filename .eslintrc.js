module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'public/',
    'tmp/',
    'coverage',
    'vite.config.mts.timestamp-*.mjs',
    '*/frontend/src/javascripts/www/',
    '*/frontend/vendor/',
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:import/typescript',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
      alias: {
        map: [
          ['~', './app/frontend']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      },
    },
  },
  env: {
    browser: true,
    es6: true,
    jquery: true, // Remove after removing jQuery
    serviceworker: true,
  },
  globals: {
    Blacklight: 'readonly',
    Turbo: 'readonly',
  },
  rules: {
    'func-names': ['error', 'never'],
    'func-style': ['off'],
    'import/no-extraneous-dependencies': 'off',
  },
  parserOptions: {
    project: ['./tsconfig.json'],
  },
};
