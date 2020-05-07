const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const CleanWebpackPlugin = require('clean-webpack-plugin')

const config = {
  entry: {
    app: ['@babel/polyfill', './src/index.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  plugins: [
    // new CleanWebpackPlugin('dist'),
    new HtmlWebpackPlugin({
      title: 'Alberta Data Institute',
      template: './src/index.html'
    }),
    new CopyWebpackPlugin([
      { from: './public/favicon.ico' },
      { from: './public/favicon-16x16.png' },
      { from: './public/favicon-32x32.png' },
      { from: './public/apple-touch-icon.png' },
      { from: './public/safari-pinned-tab.svg' },
      { from: './public/site.webmanifest' },
      { from: './public/browserconfig.xml' }
    ]),
    new webpack.NamedModulesPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.png$/,
        use: ['file-loader']
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true
        }
      }
    }
  }
};

module.exports = config;
