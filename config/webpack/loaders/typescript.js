const path = require('path');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  test: () => /\.tsx?$/ && !(env === 'production'),
  enforce: 'pre',
  include: [
    path.resolve(__dirname, 'app', 'webpacker', 'packs'),
  ],
  exclude: /node_modules/,
  use: [{
    loader: 'ts-loader',
  }],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.ts.erb', '.js.erb'],
  },
};
