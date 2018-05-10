const webpack = require('webpack');
const path = require('path');

const config = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/, 
                use: [ 'style-loader', 'css-loader' ] 
            }
        ]
    }
};
module.exports = config;