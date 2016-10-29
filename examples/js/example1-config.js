/* global requirejs */
requirejs.config({
  paths: {
    app: 'app',
    'contrail-charts': '../../lib/js/contrail-charts.min',
    'jquery': 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min',
    'd3': 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min',
    'd3v4': 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.8/d3.min',
    'underscore': 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
    'backbone': 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min'
  },
  waitSeconds: 20
})

// Start the main app logic.
requirejs(['app/example1'])
