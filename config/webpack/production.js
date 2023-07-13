process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const environment = require('./environment');

// Ignore files in tests directory in production env
environment.config.set('module.rules.exclude', /^(?!.*tests\/.*$).+\.[jt]sx?$/);

module.exports = environment.toWebpackConfig();
