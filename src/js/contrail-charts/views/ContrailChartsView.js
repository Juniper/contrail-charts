/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery",
    "underscore",
    "d3",
    "contrail-charts/views/View"
], function( $, _, d3, View ) {

        /**
         * View base class.
         */
        var ContrailChartsView = View.extend({

            defaults: {
                _type: "ContrailChartsView"
            },

            initialize: function (options) {
                this.config = options.config;
            },

            /**
             * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
             * The view may modify the params object with calculated values.
             */
            resetParams: function () {
                this.params = this.config.initializedComputedParameters();
            },

            resetParamsForChild: function( childIndex ) {
                this.params = this.config.initializedComputedParametersForChild( childIndex );
            },

            /**
            * This is how the view gets its data.
            */
            getData: function () {
                return this.model.getData();
            },

            /**
            * This is how the view gets the SVG html element selection for rendering.
            */
            svgSelection: function () {
                var self = this;
                //return d3.select(self.$el.get(0)).select("svg#" + self.id);
                return d3.select( self.el ).select( "svg" );
            }
        });

        return ContrailChartsView;
    }
);
