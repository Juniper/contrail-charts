/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

/* global requirejs */
requirejs.config({ // eslint-disable-line
  paths: {
    app: 'app',
    'underscore': '../../../../node_modules/underscore/underscore',
    'babel': '../../../../node_modules/requirejs-babel/babel-5.8.34.min',
    'contrail-charts': '../../../../build/contrail-charts',
    'jquery': '../../../../node_modules/jquery/dist/jquery',
    'backbone': '../../../../node_modules/backbone/backbone',
    'd3v4': '../../../../node_modules/d3/build/d3',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min', // Example use of multiple d3 versions. This points to older d3 version used in existing codebase.
    'lodash': '../../../../node_modules/lodash/lodash',
  },
  waitSeconds: 3
})

// Start the main app logic.
requirejs(['app/example'], function (example) {
  /**
   * Following is used to load this example specific to our loader.
   * Normally here you would be calling the example.render()
   */
  window.AMDRenderCB(example)
})
