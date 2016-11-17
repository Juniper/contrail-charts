/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
requirejs.config({ // eslint-disable-line
  paths: {
    app: 'app',
    'contrail-charts': '../../build/js/contrail-charts',
    'jquery': '../../node_modules/jquery/dist/jquery',
    'backbone': '../../node_modules/backbone/backbone',
    'd3v4': '../../node_modules/d3/build/d3',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min', // Example use of multiple d3 versions. This points to older d3 version used in exsiting codebase.
    'underscore': '../../node_modules/underscore/underscore',
    'lodash': '../../node_modules/lodash/lodash'
  },
  waitSeconds: 20
})

// Start the main app logic.
requirejs(['app/example1']) // eslint-disable-line
