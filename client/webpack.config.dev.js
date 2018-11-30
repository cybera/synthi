const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    contentBase: './dist',
    hot: true,
    proxy: {
      '/login': 'http://server:3000',
      '/logout': 'http://server:3000',
      '/graphql': 'http://server:3000',
      '/dataset': 'http://server:3000',
      '/whoami': 'http://server:3000'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({ analyzerHost: '0.0.0.0' })
  ]
});
