var webpack = require('webpack');
module.exports = {
  entry: {
    'activity': './src/activity.js',
    'activity.min': './src/activity.js',
  },
  devtool: 'source-map',
  output: {
    path: './dist',
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ]
};