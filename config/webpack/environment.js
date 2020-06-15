const { environment } = require('@rails/webpacker');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');

const webpack = require('webpack');
const erb = require('./loaders/erb');

environment.splitChunks((config) => ({
  ...config,
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
}));

environment.plugins.append('Provide', new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery',
  jquery: 'jquery',
  'window.jQuery': 'jquery',
  Popper: ['popper.js', 'default'],
  Rails: '@rails/ujs',
}));

environment.plugins.append('CleanWebpack', new CleanWebpackPlugin());

// Strip all locales except 'en' from Moment.js
environment.plugins.append('MomentLocales', new MomentLocalesPlugin());

environment.plugins.append('BrotliPlugin', new BrotliPlugin());

environment.loaders.append('expose', {
  test: require.resolve('jquery'),
  use: [{
    loader: 'expose-loader',
    options: '$',
  }, {
    loader: 'expose-loader',
    options: 'jQuery',
  }],
});

environment.loaders.prepend('erb', erb);
module.exports = environment;
