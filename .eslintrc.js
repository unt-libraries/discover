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
  ],
  env: {
    browser: true,
    es6: true,
    jquery: true, // Remove after removing jQuery
    serviceworker: true,
  },
  globals: {
    Blacklight: 'readonly',
  },
  rules: {
    'func-names': ['error', 'never'],
    'func-style': ['off'],
    'import/no-extraneous-dependencies': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'airbnb-typescript/base',
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  ],
};
