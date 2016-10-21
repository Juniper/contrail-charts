requirejs.config({
    paths: {
        app: 'app',
        'contrail-charts': '../../lib/contrail-charts.min',
        'jquery': 'lib/jquery',
        'd3': 'lib/d3',
        'd3v4': 'lib/d3v4',
        'underscore': 'lib/underscore',
        'backbone': 'lib/backbone'
    }
});

// Start the main app logic.
requirejs( ['app/example1'] );
