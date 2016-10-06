/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-charts/models/Model"
], function( _, Model ) {
    var BindingHandler = Model.extend({
    	defaults: {
    		components: {}
    	},

    	addComponent: function( componentName, component ) {
    		var savedComponent = this.get( 'components' )[componentName] = {};
    		savedComponent.config = component.config;
    		savedComponent.model = component.model;
    		savedComponent.events = component.eventObject;
    	},

        performSync: function( sourceModel, sourcePath, targetModel ) {
            var self = this;
            /*
            console.log( "performSync: ", sourcePath, this.get( 'sourcePath' ) );
            if( this.get( 'sourcePath' ) == sourcePath ) {
                // Avoid event loop.
                this.sourceModel = null;
                this.targetModel = null;
                this.set( 'sourcePath', null );
            }
            else {
                var mod = {};
                mod[sourcePath] = sourceModel.get( sourcePath );
                targetModel.set( mod, { silent: true } );
                // Always trigger a change event because we could be setting a nested object or object reference.
                this.set( 'sourcePath', sourcePath );
                targetModel.trigger( "change:" + sourcePath );
            }
            */
            //targetModel.set( sourcePath, sourceModel.get( sourcePath ) );
            /*
            var mod = {};
            mod[sourcePath] = sourceModel.get( sourcePath );
            */
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
            var components = self.get( 'components' );
            _.each( self.get( 'bindings' ), function( binding ) {
                if( _.has( components, binding.sourceComponent ) && _.has( components, binding.targetComponent ) ) {
                    if( _.has( components[binding.sourceComponent], binding.sourceModel ) && _.has( components[binding.targetComponent], binding.targetModel ) ) {
                        var sourceModel = components[binding.sourceComponent][binding.sourceModel];
                        var targetModel = components[binding.targetComponent][binding.targetModel];
                        if( sourceModel.has( binding.sourcePath ) ) {
                            if( binding.action == 'sync' ) {
                                // Two way listen for changes and perform sync on startup.
                                self.performSync( sourceModel, binding.sourcePath, targetModel );
                                self.performSync( targetModel, binding.sourcePath, sourceModel );
                            }
                        }
                    }
                }
            });
    	}
    });

    return BindingHandler;
});
