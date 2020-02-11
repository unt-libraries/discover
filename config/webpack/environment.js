const { environment } = require('@rails/webpacker');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const webpack = require('webpack');
const erb = require('./loaders/erb');

environment.plugins.append('Provide', new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery',
  jquery: 'jquery',
  'window.jQuery': 'jquery',
  Popper: ['popper.js', 'default'],
  Rails: '@rails/ujs',
}));

environment.plugins.append('CleanWebpack', new CleanWebpackPlugin());

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
