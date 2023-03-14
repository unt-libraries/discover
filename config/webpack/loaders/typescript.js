const path = require('path');

module.exports = {
  test: /\.tsx?$/,
  enforce: 'pre',
  include: [
    path.resolve(__dirname, 'app', 'webpacker', 'packs'),
    path.resolve(__dirname, 'app', 'webpacker', 'src', 'javascripts'),
  ],
  exclude: /node_modules/,
  use: [{
    loader: 'ts-loader',
  }],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
