var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var path = require('path')
var env = require('yargs').argv.mode

var fileName = 'contrail-charts'
var libraryName = 'coCharts'
var framework = 'backbone'
var plugins = []

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    include: /\.min\.js$/,
    minimize: true,
  }))
}

// Let's put css under css directory.
plugins.push(new ExtractTextPlugin('css/' + fileName + '.css'))

var config = {
  entry: {
    'contrail-charts': path.join(__dirname, '/src/js/index.js'),
    'contrail-charts.min': path.join(__dirname, '/src/js/index.js')
  },
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'js/' + '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: false,
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
      },
      {
        test: /\.html/,
        loader: "handlebars-loader",
      },
    ]
  },
  externals: {
    jquery: { amd: 'jquery', root: 'jQuery' },
    d3: { amd: 'd3v4', root: 'd3' },
    lodash: { amd: 'lodash', root: '_' },
    backbone: { amd: 'backbone', root: 'Backbone' },
  },
  resolve: {
    root: path.resolve('./src/js'),
    alias: {
      'contrail-model': 'plugins/' + framework + '/ContrailModel',
      'contrail-view': 'plugins/' + framework + '/ContrailView',
      'contrail-events': 'plugins/' + framework + '/ContrailEvents',

      'contrail-charts-data-model': 'plugins/contrail/ContrailChartsDataModel',
      'contrail-charts-config-model': 'plugins/contrail/ContrailChartsConfigModel',
      'contrail-charts-view': 'plugins/contrail/ContrailChartsView',
      'contrail-charts-events': 'plugins/contrail/ContrailChartsEvents',
    },
    extensions: ['', '.js']
  },
  plugins: plugins,
}

module.exports = config
