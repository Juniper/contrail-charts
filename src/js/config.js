requirejs.config({
    paths: {
        'contrail-charts': 'contrail-charts'
        //requirejs: 'lib/require',
        //jquery: 'lib/jquery',
        //d3: 'lib/d3',
        //underscore: 'lib/underscore',
        //backbone: 'lib/backbone'
    },
    packages: [

    ],
    shim: {
        backbone: {
            deps: [ 'underscore', 'jquery' ]
        }
    }
});
