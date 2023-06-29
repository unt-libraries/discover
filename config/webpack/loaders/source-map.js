module.exports = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: [{
    loader: 'source-map-loader',
  }],
  enforce: 'pre',
};
