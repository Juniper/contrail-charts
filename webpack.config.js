var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var path = require('path')
var env = require('yargs').argv.mode

var fileName = 'contrail-charts'
var libraryName = 'coCharts'

var plugins = []
var outputFile

if (env === 'lib') {
  plugins.push(new UglifyJsPlugin({ minimize: true }))
  outputFile = fileName + '.min.js'
} else {
  outputFile = fileName + '.js'
}

// Let's put css under css directory.
plugins.push(new ExtractTextPlugin('css/' + fileName + '.css'))

var config = {
  entry: path.join(__dirname, '/src/js/contrail-charts.js'),
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: 'js/' + outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: false
  },
  module: {
    loaders: [
      /*
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
      */
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
      }
    ]
  },
  externals: {
    jquery: { amd: 'jquery', root: 'jQuery' },
    d3: { amd: 'd3v4', root: 'd3' },
    underscore: { amd: 'underscore', root: '_' },
    backbone: { amd: 'backbone', root: 'Backbone' }
  },
  resolve: {
    root: path.resolve('./src/js'),
    extensions: ['', '.js']
  },
  plugins: plugins
}

module.exports = config