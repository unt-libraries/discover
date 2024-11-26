module.exports = {
  test: /\.erb$/,
  enforce: 'pre',
  exclude: /node_modules/,
  use: [{
    loader: 'rails-erb-loader',
  }],
};
