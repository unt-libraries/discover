/* eslint-disable global-require */
module.exports = function (api) {
  const validEnv = ['development', 'test', 'production'];
  const currentEnv = api.env();
  const isDevelopmentEnv = api.env('development');
  const isProductionEnv = api.env('production');
  const isTestEnv = api.env('test');

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      `Please specify a valid \`NODE_ENV\` or \`BABEL_ENV\` environment variables. Valid values are "development", "test", and "production". Instead, received: ${JSON.stringify(currentEnv)}.`,
    );
  }

  return {
    presets: [
      isTestEnv && [
        require('@babel/preset-env'),
        {
          // targets: {
          //   node: 'current',
          // },
          debug: true,
          // modules: false,
          useBuiltIns: 'usage',
          corejs: {
            version: '3.29',
            proposals: true,
          },
          shippedProposals: true,
        },
      ],
      (isProductionEnv || isDevelopmentEnv) && [
        require('@babel/preset-env'),
        {
          debug: true,
          modules: false,
          useBuiltIns: 'usage',
          corejs: {
            version: '3.29',
            proposals: true,
          },
          shippedProposals: true,
        },
      ],
      isProductionEnv && [
        require('@babel/preset-env'),
        {
          exclude: /^(?!.*tests\/.*$).+\.[jt]sx?$/,
        },
      ],
      require('@babel/preset-typescript'),
    ].filter(Boolean),
    plugins: [
      require('babel-plugin-macros'),
      isTestEnv && require('babel-plugin-dynamic-import-node'),
      require('@babel/plugin-transform-runtime'),
    ].filter(Boolean),
  };
};
