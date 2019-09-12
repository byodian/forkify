const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: ['babel-polyfill', './src/js/index.js', './src/css/style.css'  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'source-map',
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ 
      filename: 'index.html',
      template: 'src/index.html',
      minify: true
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? 'css/style.css' : 'css/style.[hash].css',
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options :{
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(png|gif|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {  
              outputPath: 'img',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  }
}