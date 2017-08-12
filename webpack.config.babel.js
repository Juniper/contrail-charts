/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {join} from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'

let fileName = 'contrail-charts'
const libraryName = 'cc'
const paths = {
  framework: 'plugins/backbone/',
  core: 'core/',
}
function absolute (...args) {
  return join(__dirname, ...args)
}
const defaultEnv = {'dev': true}
/**
 * Following allows publishing compiled files to multiple paths.
 * add path relative to directory of this config file.
 * For eg: if you need to output the compiled output in lib dir of parent dir contrail-charts-demo,
 * use '../contrail-charts-demo/lib'
 * @type {Array}
 */
const publishPaths = []

export default (env = defaultEnv) => {
  const plugins = []
  const rules = [{
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader']
    }),
  }, {
    test: /\.html/,
    loader: 'handlebars-loader',
  }, {
    loader: 'babel-loader',
    test: /\.js$/,
    include: /(src)/,
    query: {
      presets: ['es2015'],
    }
  }]
  /**
   * By default we will exclude bundling d3 modules with library.
   * To make it easier to use this library, all modules are resolved to d3.
   * Keep d3 version 4 in global scope or in amd scenario, export d3 version 4 as d3v4.
   * In the case of co-existing with older version of d3:
   *  1. in amd, use d3 to point to older version and use d3v4 to point to version 4
   *  2. other cases, use library bundled with the d3 v4 modules. build library with 'npm run build:lib:withD3'
   *     use the built contrail-charts.bundle.js or min file
   *
   *  Note: updating d3 specific module which are not dependencies, update d3Libs. d3Libs is used to track externals.
   *  When we need a build with all d3 packages set include env 'd3-all' or pass individual library name to be included.
   */
  let d3Libs = ['d3', 'd3-selection', 'd3-scale', 'd3-shape', 'd3-array', 'd3-axis', 'd3-ease', 'd3-brush',
    'd3-time-format', 'd3-hierarchy', 'd3-geo', 'd3-zoom', 'd3-quadtree']

  let externals = {
    jquery: { amd: 'jquery', commonjs: 'jquery', commonjs2: 'jquery', root: 'jQuery' },
    lodash: { amd: 'lodash', commonjs: 'lodash', commonjs2: 'lodash', root: '_' },
    backbone: { amd: 'backbone', commonjs: 'backbone', commonjs2: 'backbone', root: 'Backbone' },
  }

  let entry = {
    [fileName]: absolute('src/index.js'),
    [`${fileName}.min`]: absolute('src/index.js')
  }

  if (env.include) {
    externals = {}
    entry = {
      [`${fileName}.bundle.min`]: absolute('src/index.js')
    }
  } else {
    d3Libs.forEach(d3Lib => {
      externals[d3Lib] = { amd: 'd3v4', commonjs: 'd3', commonjs2: 'd3', root: 'd3' }
    })
  }

  if (env.prod) {
    plugins.push(new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      mangle: {
        keep_fnames: true,
      },
      include: /\.min\.js$/,
    }))
  }

  // Let's put css under css directory.
  plugins.push(new ExtractTextPlugin(fileName + '.css'))

  const configList = []

  const config = {
    entry,
    devtool: 'source-map',
    module: {rules},
    externals: externals,
    resolve: {
      modules: [absolute('src'), 'node_modules'],
      alias: {
        'contrail-model': paths.framework + 'ContrailModel',
        'contrail-view': paths.framework + 'ContrailView',
        'contrail-events': paths.framework + 'ContrailEvents',

        'data-model': paths.core + 'DataModel',
        'config-model': paths.core + 'ConfigModel',
        'chart-view': paths.core + 'ChartView',
        'utils': paths.core + 'Utils',
      },
      extensions: ['.js'],
    },
    plugins: plugins,
    stats: { children: false }
  }

  const defaultConfig = Object.assign({}, config, {
    output: {
      path: absolute('build'),
      filename: '[name].js',
      library: libraryName,
      libraryTarget: 'umd',
      umdNamedDefine: false,
    }
  })
  configList.push(defaultConfig)

  if (publishPaths) {
    publishPaths.forEach((outPath) => {
      configList.push(Object.assign({}, config, {
        output: {
          path: absolute(outPath),
          filename: '[name].js',
          library: libraryName,
          libraryTarget: 'umd',
          umdNamedDefine: false,
        }
      }))
    })
  }

  return configList
}
