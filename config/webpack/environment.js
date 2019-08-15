const { environment } = require('@rails/webpacker');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const webpack = require('webpack');
const erb = require('./loaders/erb');

environment.plugins.append('Provide', new webpack.ProvidePlugin({
  $: 'jquery',
  jQuery: 'jquery',
  Popper: ['popper.js', 'default'],
}));

environment.plugins.append('CleanWebpack', new CleanWebpackPlugin());

environment.loaders.prepend('erb', erb);
module.exports = environment;
