var webpack = require( 'webpack' );
var ExtractTextPlugin = require( "extract-text-webpack-plugin" );
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require( 'path' );
var env = require( 'yargs' ).argv.mode;

var fileName = 'contrail-charts';
var libraryName = 'coCharts';

var plugins = [], outputFile;

if (env === 'lib') {
  plugins.push( new UglifyJsPlugin({ minimize: true }) );
  outputFile = fileName + '.min.js';
} else {
  outputFile = fileName + '.js';
}

plugins.push( new ExtractTextPlugin( fileName + ".css" ) );

var config = {
  entry: __dirname + '/src/js/contrail-charts.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
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
        loader: ExtractTextPlugin.extract( "style-loader", "css-loader!sass-loader" )
      }
    ]
  },
  externals: {
    jquery: 'jquery',
    d3: 'd3v4',
    underscore: 'underscore',
    backbone: 'backbone'
  },
  resolve: {
    root: path.resolve('./src/js'),
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
