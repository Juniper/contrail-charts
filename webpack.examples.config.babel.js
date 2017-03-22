/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {join} from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

const fileName = 'contrail-charts-examples'

function absolute (...args) {
  return join(__dirname, ...args)
}
const defaultEnv = {dev: true}

export default (env = defaultEnv) => {
  const plugins = [
    new ExtractTextPlugin('css/' + fileName + '.css'),
  ]
  const loaders = [{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader']
    }),
  }, {
    test: /\.html/,
    loader: 'handlebars-loader',
  }]

  if (env.prod) {
    plugins.push(new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        keep_fnames: true,
      },
      sourceMap: true,
      include: /\.js$/,
    }))
  }
  loaders.push({
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /(node_modules)/,
    query: {
      presets: ['es2015']
    }
  })

  return {
    entry: {
      'loader': absolute('examples/common/js/loader')
    },
    devtool: 'source-map',
    output: {
      path: absolute('/build/examples'),
      filename: '[name].bundle.js'
    },
    module: {loaders},
    externals: {
      jquery: { amd: 'jquery', root: 'jQuery' },
      d3: { amd: 'd3v4', root: 'd3' },
      // lodash: { amd: 'lodash', root: '_' },
      backbone: { amd: 'backbone', root: 'Backbone' },
      coCharts: 'coCharts'
    },
    resolve: {
      modules: [absolute(), 'node_modules'],
      alias: {
        'fixture': 'tests/generator.js',
        'formatter': 'examples/common/js/value-formatters.js',
        'constants': 'examples/common/js/constants.js',
        'commons': 'examples/common/js/commons.js',
        'data-generator': 'examples/common/js/data-generator.js'
      },
      extensions: ['.js']
    },
    plugins: plugins,
    stats: { children: false },
    devServer: {
      publicPath: '/build/examples/',
      compress: true,
      port: 9000
    }
  }
}
