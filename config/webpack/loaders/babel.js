module.exports = {
  test: /\.m?[jt]sx?$/,
  exclude: [
    /node_modules/,
    /vendor\/fontawesome\/js/,
    ],
  use: [{
    loader: 'babel-loader',
  }],
};
