requirejs.config({
    paths: {
        app: 'app',
        'contrail-charts': '../../build/js/contrail-charts',
        'jquery': '../../build/js/lib/jquery',
        'd3': '../../build/js/lib/d3',
        'underscore': '../../build/js/lib/underscore',
        'backbone': '../../build/js/lib/backbone'
    },
    packages: [

    ],
    shim: {
        bootstrap: {
            deps: [ 'jquery' ]
        },
        backbone: {
            deps: [ 'underscore', 'jquery' ]
        }
    }
});

// Start the main app logic.
requirejs( ['app/examples'] );
