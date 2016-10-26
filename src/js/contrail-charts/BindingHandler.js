/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-charts/models/Model"
], function( _, Model ) {
    var BindingHandler = Model.extend({
    	defaults: {
            charts: {},
            bindings: []
    	},

        /**
        * Saves information about a component in a chart.
        * This information will be used later in order to perform bindings defined in a configuration.
        */
    	addComponent: function( chartId, componentName, component ) {
            console.log( "Adding component to BindingHandler: ", chartId, componentName );
            chartId = chartId || 'default';
            var savedChart = this.get( 'charts' )[chartId];
            if( !savedChart ) {
                savedChart = this.get( 'charts' )[chartId] = {};
            }
    		var savedComponent = savedChart[componentName] = {};
    		savedComponent.config = component.config;
    		savedComponent.model = component.model;
    		savedComponent.events = component.eventObject;
    	},

        addBindings: function( bindings, defaultChartId ) {
            var self = this;
            defaultChartId = defaultChartId || 'default';
            _.each( bindings, function( binding ) {
                if( !binding.sourceChart ) {
                    binding.sourceChart = defaultChartId;
                }
                if( !binding.targetChart ) {
                    binding.targetChart = defaultChartId;
                }
                self.get( 'bindings' ).push( binding );
            });
        },

        performSync: function( sourceModel, sourcePath, targetModel ) {
            var self = this;
            targetModel.set( sourcePath, sourceModel.get( sourcePath ) );
            if( _.isObject( sourceModel.get( sourcePath ) ) ) {
                // Perform manual event trigger.
                targetModel.trigger( "change" );
                targetModel.trigger( "change:" + sourcePath );
            }
            self.listenToOnce( sourceModel, "change:"+sourcePath, function() {
                self.performSync( sourceModel, sourcePath, targetModel );
            });
        },

    	/**
    	* Set all the bindings defined in the config.
    	*/
    	start: function() {
    		var self = this;
            var charts = self.get( 'charts' );
            _.each( self.get( 'bindings' ), function( binding ) {
                if( _.has( charts, binding.sourceChart ) && _.has( charts, binding.targetChart ) ) {
                    if( _.has( charts[binding.sourceChart], binding.sourceComponent ) && _.has( charts[binding.targetChart], binding.targetComponent ) ) {
                        if( _.has( charts[binding.sourceChart][binding.sourceComponent], binding.sourceModel ) && _.has( charts[binding.targetChart][binding.targetComponent], binding.targetModel ) ) {
                            var sourceModel = charts[binding.sourceChart][binding.sourceComponent][binding.sourceModel];
                            var targetModel = charts[binding.targetChart][binding.targetComponent][binding.targetModel];
                            if( binding.action == 'sync' ) {
                                // Two way listen for changes and perform sync on startup.
                                self.performSync( sourceModel, binding.sourcePath, targetModel );
                                self.performSync( targetModel, binding.sourcePath, sourceModel );
                            }
                            else if( _.isFunction( binding.action ) ) {
                                self.listenTo( sourceModel, binding.sourcePath, _.partial( binding.action, sourceModel, targetModel ) );
                            }
                        }
                    }
                }
            });
    	}
    });

    return BindingHandler;
});
