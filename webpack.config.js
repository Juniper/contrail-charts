var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var path = require('path')
var env = require('yargs').argv.mode

var fileName = 'contrail-charts'
var libraryName = 'coCharts'
var framework = 'backbone'

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
  entry: path.join(__dirname, '/src/js/contrail-charts/index.js'),
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
    lodash: { amd: 'lodash', root: '_' },
    backbone: { amd: 'backbone', root: 'Backbone' }
  },
  resolve: {
    root: path.resolve('./src/js'),
    alias: {
      'contrail-model': 'contrail-charts/plugins/' + framework + '/ContrailModel',
      'contrail-view': 'contrail-charts/plugins/' + framework + '/ContrailView',
      'contrail-events': 'contrail-charts/plugins/' + framework + '/ContrailEvents',

      'contrail-charts-data-model': 'contrail-charts/plugins/contrail/ContrailChartsDataModel',
      'contrail-charts-config-model': 'contrail-charts/plugins/contrail/ContrailChartsConfigModel',
      'contrail-charts-view': 'contrail-charts/plugins/contrail/ContrailChartsView',
      'contrail-charts-events': 'contrail-charts/plugins/contrail/ContrailChartsEvents'
    },
    extensions: ['', '.js']
  },
  plugins: plugins
}

module.exports = config
