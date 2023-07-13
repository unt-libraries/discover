process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const environment = require('./environment');

// Ignore files in tests directory in production env
environment.config.set('module.rules.exclude', {
  test: /^(?!.*tests\/.*$).+\.[jt]sx?$/,
  enforce: 'pre',
  // exclude js, jsx, ts, and tsx files in the js directory
  exclude: /\.(js|jsx|ts|tsx)?(\.erb)?$/,
});

module.exports = environment.toWebpackConfig();
