/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery",
    "underscore",
    "d3",
    "contrail-charts/models/Events",
    "contrail-charts/views/ContrailChartsView",
    "contrail-charts/models/DataProvider",
    "contrail-charts/views/CompositeYChartView"
], function(
    $, _, d3, Events, ContrailChartsView, DataProvider,
    CompositeYChartView
) {
    var NavigationView = ContrailChartsView.extend({
        tagName: "div",
        className: "navigation-view",

        initialize: function (options) {
            var self = this;
            self.config = options.config;
            //self.resetParams();
            self.template = contrail.getTemplate4Id( "coCharts-navigation-panel" );

            // NavigationView does not react itself to model changes. Instead it listens to compositeYChartView render events
            // and updates itself every time the compositeYChartView renders itself.
            self.isModelChanged = false;
            self.listenTo( self.model, "change", self.modelChanged );
            self.listenTo( self.config, "change", self.modelChanged );
            self.eventObject = _.extend( {}, Events );

            self.focusDataProvider = new DataProvider( {parentDataModel: self.model} );
            self.brush = null;

            self.compositeYChartView = null;
        },

        events: {
            "click .prev>a": "prevChunkSelected",
            "click .next>a": "nextChunkSelected"
        },

        modelChanged: function() {
            this.isModelChanged = true;
        },

        handleModelChange: function (e) {
            var self = this;
            var x = self.params.xAccessor;
            var rangeX = self.model.getRangeFor( x );
            // Fetch the previous data window position
            var prevWindowXMin = undefined;
            var prevWindowXMax = undefined;
            var prevWindowSize = undefined;
            if( self.config.has( "focusDomain" ) ) {
                var prevFocusDomain = self.config.get( "focusDomain" );
                if( _.isArray( prevFocusDomain[x] ) ) {
                    prevWindowXMin = prevFocusDomain[x][0];
                    prevWindowXMax = prevFocusDomain[x][1];
                    prevWindowSize = prevWindowXMax - prevWindowXMin;
                }
            }
            // Try to keep the same data window. Move it if exceeds data range.
            if( !_.isUndefined(prevWindowXMin) && !_.isUndefined(prevWindowXMax) ) {
                var xMin = prevWindowXMin;
                var xMax = prevWindowXMax;
                if (xMin < rangeX[0]) {
                    xMin = rangeX[0];
                }
                if (xMin > rangeX[1] - prevWindowSize) {
                    xMin = rangeX[1] - prevWindowSize;
                }
                if (xMax > rangeX[1]) {
                    xMax = rangeX[1];
                }
                if (xMax < rangeX[0] + prevWindowSize) {
                    xMax = rangeX[0] + prevWindowSize;
                }
                var newFocusDomain = {};
                newFocusDomain[x] = [xMin, xMax];
                if( xMin != prevWindowXMin || xMax != prevWindowXMax ) {
                    self.focusDataProvider.setRangeFor( newFocusDomain );
                    self.config.set( { focusDomain: newFocusDomain }, { silent: true } );
                }

                var brushGroup = self.svgSelection().select( "g.brush" ).transition().ease( d3.easeLinear ).duration( self.params.duration );
                self.brush.move( brushGroup, [self.params.xScale(xMin), self.params.xScale(xMax)] );
            }
            else {
                self.removeBrush();
            }
        },

        removeBrush: function() {
            var self = this;
            var svg = self.svgSelection();
            svg.select( "g.brush" ).remove();
            self.brush = null;
        },

        prevChunkSelected: function () {
            var range = this.model.getRange();
            var x = this.params.xAccessor;
            var rangeDiff = range[x][1] - range[x][0];
            var queryLimit = {};
            queryLimit[x] = [range[x][0] - rangeDiff * 0.5, range[x][1] - rangeDiff * 0.5];
            this.model.setQueryLimit( queryLimit );
            // TODO: show some waiting screen?
        },

        nextChunkSelected: function () {
            var range = this.model.getRange();
            var x = this.params.xAccessor;
            var rangeDiff = range[x][1] - range[x][0];
            var queryLimit = {};
            queryLimit[x] = [range[x][0] + rangeDiff * 0.5, range[x][1] + rangeDiff * 0.5];
            this.model.setQueryLimit( queryLimit );
            // TODO: show some waiting screen?
        },

        getFocusDataProvider: function () {
            return this.focusDataProvider;
        },

        initializeAndRenderCompositeYChartView: function() {
            var self = this;
            self.compositeYChartView = new CompositeYChartView({
                model: self.model,
                config: self.config,
                el: self.el,
                id: self.id
            });
            self.listenTo( self.compositeYChartView.eventObject, "rendered", self.chartRendered );
            self.compositeYChartView.render();
            /*
            if( tooltipView ) {
                tooltipView.registerTriggerEvent( compositeYChartView.eventObject, "showTooltip", "hideTooltip" );
            }
            */
        },

        /**
        * This method will be called when the chart is rendered.
        */
        chartRendered: function() {
            var self = this;
            self.params = self.compositeYChartView.params;
            if( self.isModelChanged ) {
                self.handleModelChange();
                self.isModelChanged = false;
            }
            self.renderBrush();
            //self.renderPageLinks();
        },

        /**
        * This needs to be called after compositeYChartView render.
        */
        renderBrush: function () {
            var self = this;
            console.log( "NavigationView renderBrush: ", self.params );
            var x = self.params.xAccessor;
            if( !self.brush ) {
                var svg = self.svgSelection();
                var marginInner = self.params.marginInner;
                var brushHandleHeight = 16;//self.params.yRange[0] - self.params.yRange[1];
                var brushHandleCenter = (self.params.yRange[0] - self.params.yRange[1] + 2 * marginInner) / 2
                self.brush = d3.brushX()
                    .extent( [
                        [self.params.xRange[0] - marginInner, self.params.yRange[1] - marginInner],
                        [self.params.xRange[1] + marginInner, self.params.yRange[0] + marginInner]] )
                    .handleSize( 10 )
                    .on( "brush", function () {
                        var dataWindow = d3.event.selection;
                        var xMin = self.params.xScale.invert( dataWindow[0] );
                        var xMax = self.params.xScale.invert( dataWindow[1] );
                        var focusDomain = {};
                        focusDomain[x] = [xMin, xMax];
                        self.config.set( { focusDomain: focusDomain }, { silent: true } );
                        self.focusDataProvider.setRangeFor( focusDomain );
                        self.eventObject.trigger( "windowChanged", xMin, xMax );

                        var gHandles = svg.select( "g.brush" ).selectAll( ".handle--custom" );
                        if( dataWindow ) {
                            gHandles
                                .classed( "hide", false )
                                .attr( "transform", function( d, i ) { return "translate(" + dataWindow[i] + "," + brushHandleCenter + ") scale(1,2)"; } );
                        }
                        else {
                            gHandles.classed( "hide", true );
                        }
                    });
                var gBrush = svg.append( "g" ).attr( "class", "brush" ).call( self.brush );

                var handle = gBrush.selectAll( ".handle--custom" )
                    .data( [{type: "w"}, {type: "e"}] )
                    .enter().append( "path" )
                    .attr( "class", "handle--custom hide" )
                    .attr( "fill", "#666" )
                    .attr( "fill-opacity", 0.75 )
                    .attr( "stroke", "#444" )
                    .attr( "stroke-width", 1 )
                    .attr( "cursor", "ew-resize" )
                    .attr( "d", d3.arc()
                        .innerRadius( 0 )
                        .outerRadius( brushHandleHeight / 2 )
                        .startAngle( 0 )
                        .endAngle( function(d, i) { return i ? Math.PI : -Math.PI; }) );
            }
        },

        renderPageLinks: function () {
            var self = this;
            if( !self.$el.find( ".page-links" ).length ) {
                $( "<div>" ).appendTo( self.$el ).addClass( "page-links" );
            }
            self.$el.find( ".page-links" ).html( self.template() );
        },

        render: function () {
            var self = this;
            if( !self.compositeYChartView ) {
                // One time compositeYChartView initialization.
                self.initializeAndRenderCompositeYChartView();
                // From this moment the compositeYChartView is independent from NavigationView. It will react to config / model changes on it's own.
            }
            return self;
        }
    });

    return NavigationView;
});
