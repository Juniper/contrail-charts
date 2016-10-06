/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery", "underscore", "d3",
    "contrail-charts/models/Events",
    "contrail-charts/views/ContrailChartsView",
    "contrail-charts/views/components/LineChartView",
    "contrail-charts/views/components/GroupedBarChartView",
    "contrail-charts/views/components/StackedBarChartView",
    "contrail-charts/views/components/ScatterBubbleChartView"
], function (
    $, _, d3,
    Events, ContrailChartsView,
    LineChartView, BarChartView, StackedBarChartView, ScatterBubbleChartView
) {
    var CompositeYChartView = ContrailChartsView.extend({
    	tagName: "div",
    	chartType: "compositeY",

    	initialize: function (options) {
            var self = this;
            // TODO: Every model change will trigger a redraw. This might not be desired - dedicated redraw event?

            /// The config model
            self.config = options.config;
            console.log( "CompositeYChartView initialize" );

            /// View params hold values from the config and computed values.
            self.debouncedRenderFunction = _.bind( _.debounce( self.actualRender, 10 ), self );
            self.listenTo( self.model, "change", self.dataModelChanged );
            self.listenTo( self.config, "change", self.configModelChanged );
            self.eventObject = _.extend( {}, Events );
            self.handleWindowResize();
        },

        handleWindowResize: function() {
            var self = this;
            var throttled = _.throttle( function() {
                self.render();
            }, 100 );
            $( window ).resize( throttled );
        },

        resetParams: function() {
            // Reset parents params
            this.params = this.config.initializedComputedParameters();
            // Reset params for all children.
            // This way every child component can have access to parents config and still have its own computed params stored in config.
            _.each( this.components, function( component, i ) {
                component.resetParamsForChild( i );
            });
        },

        possibleChildViews: { line: LineChartView, bar: BarChartView, stackedBar: StackedBarChartView, scatterBubble: ScatterBubbleChartView },

        /**
        * Update the components array based on the accessorData.
        */
        updateChildComponents: function() {
            var self = this;
            self.components = [];
            _.each( self.config.get( "accessorData" ), function( accessor, key ) {
                if( !_.isFinite( accessor.y ) || accessor.y < 0 ) {
                    accessor.y = 1;
                }
                var axisName = "y" + accessor.y;
                if( accessor.chartType && (!_.has( accessor, 'enable' ) || accessor.enable) ) {
                    var componentName = axisName + "-" + accessor.chartType;
                    var foundComponent = _.find( self.components, function( component ) { return component.getName() == componentName; } );
                    if( !foundComponent ) {
                        // The child component with this name does not exist yet. Instantiate the child component.
                        _.each( self.possibleChildViews, function( ChildView, chartType ) {
                            if( chartType == accessor.chartType ) {
                                // TODO: a way to provide a different model to every child
                                // TODO: pass eventObject to child?
                                foundComponent = new ChildView({
                                    model: self.model,
                                    config: self.config,
                                    el: self.el,
                                    id: self.id,
                                    axisName: axisName
                                });
                                self.components.push( foundComponent );
                            }
                        });
                    }
                }
            });
            // Order the components so the highest order components get rendered first.
            self.components.sort( function( a, b ) { return b.renderOrder - a.renderOrder; } );
        },

        /**
        * Calculates the activeAccessorData that holds only the verified and enabled accessors from the accessorData structure.
        * Params: activeAccessorData, yAxisInfoArray
        */
        calculateActiveAccessorData: function () {
            var self = this;
            data = self.getData();
            self.params.activeAccessorData = {};
            self.params.yAxisInfoArray = [];
            console.log( "data: ", data );
            // Initialize the components activeAccessorData structure
            _.each( self.components, function( component ) {
                component.params.activeAccessorData = {};
                component.params.enable = false;
            });
            // Fill the activeAccessorData structure.
            _.each( self.params.accessorData, function ( accessor, key ) {
                if( !_.isFinite( accessor.y ) || accessor.y < 0 ) {
                    accessor.y = 1;
                }
                var axisName = "y" + accessor.y;
                var component = self.getComponent( axisName, accessor.chartType );
                if( component ) {
                    if( !_.has( accessor, 'enable' ) || accessor.enable /*&& _.has( data[0], key )*/ ) {
                        self.params.activeAccessorData[key] = accessor;
                        var foundAxisInfo = _.findWhere( self.params.yAxisInfoArray, { name: axisName } );
                        if( !foundAxisInfo ) { 
                        	foundAxisInfo = {
                            	name: axisName,
                            	used: 0,
                            	position: ((accessor.y % 2) ? "left" : "right"),
                            	num: Math.floor( (accessor.y - 1) / 2),
                                accessors: []
                            };
                            self.params.yAxisInfoArray.push( foundAxisInfo );
                        }
                        foundAxisInfo.used++;
                        foundAxisInfo.accessors.push( key );
                        if( accessor.chartType ) {
                            // Set the activeAccessorData to the appropriate components.
                            if( component ) {
                                component.params.activeAccessorData[key] = accessor;
                                component.params.enable = true;
                            }
                        }
                    }
                }
            });
        },

        /**
         * Calculates the chart dimensions and margins.
         * Use the dimensions provided in the config. If not provided use all available width of container and 3/4 of this width for height.
         * This method should be called before rendering because the available dimensions could have changed.
         * Params: chartWidth, chartHeight, margin, marginTop, marginBottom, marginLeft, marginRight, marginInner.
         */
        calculateDimmensions: function () {
            var self = this;
            if( !self.params.chartWidth ) {
                self.params.chartWidth = self.$el.width();
            }
            if( self.params.chartWidthDelta ) {
                self.params.chartWidth += self.params.chartWidthDelta;
            }
            if( !self.params.chartHeight ) {
                self.params.chartHeight = Math.round(3 * self.params.chartWidth / 4);
            }
            if( !self.params.margin ) {
            	self.params.margin = 5;
            }
            if( !self.params.marginInner ) {
            	self.params.marginInner = 0;
            }
            // If the side margin (ie marginLeft) was not set in config then use global margin and add extra space for
            // title and / or axis if they were defined (ie. titleLeft adds 30 pixels to the marginLeft parameter).
            var elementsThatNeedMargins = {title: 30, axis: 30};
            _.each(["Top", "Bottom", "Left", "Right"], function (side) {
                if (!self.params["margin" + side]) {
                    self.params["margin" + side] = self.params.margin;
                    _.each(elementsThatNeedMargins, function (marginAdd, key) {
                        if (self.params[key + side]) {
                            // The side margin was undefined and we need addition room (for axis, title, etc.)
                            self.params["margin" + side] += marginAdd;
                        }
                    });
                }
            });
        },

        /**
         * Use the scales provided in the config or calculate them to fit data in view.
         * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
         * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
         */
        calculateScales: function () {
            var self = this;
            // Calculate the starting and ending positions in pixels of the chart data drawing area.
            self.params.xRange = [self.params.marginLeft + self.params.marginInner, self.params.chartWidth - self.params.marginRight - self.params.marginInner];
            self.params.yRange = [self.params.chartHeight - self.params.marginInner - self.params.marginBottom, self.params.marginInner + self.params.marginTop];
            self.saveScales();
            // Now let every component perform it's own calculations based on the provided X and Y scales.
            _.each( self.components, function( component ) {
                if( _.isFunction( component.calculateScales ) ) {
                    component.calculateScales();
                }
            });
        },

        getComponent: function( axisName, chartType ) {
            var self = this;
            var foundComponent = null;
            var componentName = axisName + "-" + chartType;
            _.each( self.components, function( component ) {
                if( component.getName() == componentName ) {
                    foundComponent = component;
                }
            });
            return foundComponent;
        },

        getComponents: function( axisName ) {
            var self = this;
            var foundComponents = [];
            _.each( self.components, function( component ) {
                if( _.contains( component.params.handledAxisNames, axisName ) ) {
                    foundComponents.push( component );
                }
            });
            return foundComponents;
        },

        /**
        * Combine the axis domains (extents) from all enabled components.
        */
        combineAxisDomains: function() {
            var self = this;
            var domains = {};
            _.each( self.components, function( component ) {
                if( component.params.enable ) {
                    var componentDomains = component.calculateAxisDomains();
                    _.each( componentDomains, function( domain, axisName ) {
                        if( !_.has( domains, axisName ) ) {
                            domains[axisName] = [domain[0], domain[1]];
                        }
                        else {
                            // check if the new domains extent extends the current one
                            if( domain[0] < domains[axisName][0] ) {
                                domains[axisName][0] = domain[0];
                            }
                            if( domain[1] > domains[axisName][1] ) {
                                domains[axisName][1] = domain[1];
                            }
                        }
                        // Override axis domain based on axis config.
                        if( self.hasAxisConfig( axisName, 'domain' ) ) {
                            if( !_.isUndefined( self.params.axis[axisName].domain[0] ) ) {
                                domains[axisName][0] = self.params.axis[axisName].domain[0];
                            }
                            if( !_.isUndefined( self.params.axis[axisName].domain[1] ) ) {
                                domains[axisName][1] = self.params.axis[axisName].domain[1];
                            }
                        }
                    });
                }
            });
            // Now:
            // domains.y1 holds the maximum extent (domain) for all variables displayed on the Y1 axis
            // domains.y2 holds the maximum extent (domain) for all variables displayed on the Y2 axis
            // domains.y3 ...
            // domains.r[shape] holds the maximum extent (domain) of the shape's size.
            return domains;
        },

        /**
        * Save all scales in the params and component.params structures.
        */
        saveScales: function() {
        	var self = this;
        	var domains = self.combineAxisDomains();
            _.each( domains, function( domain, axisName ) {
                var domainName = axisName + "Domain";
                if( !_.isArray( self.config.get( domainName ) ) ) {
                    self.params[domainName] = domain;
                }
                var scaleName = axisName + "Scale";
                var rangeName = axisName.charAt( 0 ) + "Range";
                if( !_.isFunction( self.config.get( scaleName ) ) && self.params[rangeName] ) {
                    var baseScale = null;
                    if( self.hasAxisConfig( axisName, 'scale' ) ) {
                        if( _.isFunction( self.params.axis[axisName].scale ) ) {
                            baseScale = self.params.axis[axisName].scale;
                        }
                        else {
                            baseScale = d3[self.params.axis[axisName].scale]();
                        }
                    }
                    else if( axisName == "x" ) {
                        baseScale = d3.scaleTime();
                    }
                    else {
                        baseScale = d3.scaleLinear();
                    }
                    self.params[scaleName] = baseScale.domain( self.params[domainName] ).range( self.params[rangeName] );
                    if( self.hasAxisConfig( axisName, 'nice' ) && self.params.axis[axisName].nice ) {
                        self.params[scaleName] = self.params[scaleName].nice( self.params.xTicks );
                    }
                }
                // Now update the scales of the appropriate components.
                _.each( self.getComponents( axisName ), function( component ) {
                    component.params[scaleName] = self.params[scaleName];
                });
            });
        },

        /**
         * Renders the svg element with axis and component groups.
         * Resizes chart dimensions if chart already exists.
         */
        renderSVG: function () {
            var self = this;
            var translate = self.params.xRange[0] - self.params.marginInner;
            var svgs = d3.select( self.el ).select( "svg" );
            if( svgs.empty() ) {
                d3.select( self.el ).append( "svg" )
                    .attr( "id", self.id )
                    .append( "g" )
                        .attr( "class", "axis x-axis" )
                        .attr( "transform", "translate(0," + ( self.params.yRange[1] - self.params.marginInner ) + ")" );
            }
            // Handle Y axis
            var svgYAxis = self.svgSelection().selectAll( ".axis.y-axis" ).data( self.params.yAxisInfoArray, function( d ) {
                return d.name;
            });
            svgYAxis.exit().remove()
            svgYAxis.enter()
                .append( "g" )
                .attr( "class", function( d ) { return "axis y-axis " + d.name + "-axis"; } )
                .merge( svgYAxis )
                .attr("transform", "translate(" + translate + ",0)");
            // Handle component groups
            var svgComponentGroups = self.svgSelection().selectAll( ".component-group" ).data( self.components, function( c ) {
                return c.getName();
            });
            svgComponentGroups.enter().append( "g" )
                .attr( "class", function( component ) {
                    return "component-group component-" + component.getName() + " " + component.className;
                } );
            // Every component can add a one time (enter) code into it's component group.
            svgComponentGroups.enter().each( function( component ) {
                if( _.isFunction( component.renderSVG ) ) {
                     d3.select( this ).select( ".component-" + component.getName() ).call( component.renderSVG );
                }
            });
            svgComponentGroups.exit().remove();
            // Handle (re)size.
            self.svgSelection()
                .attr("width", self.params.chartWidth)
                .attr("height", self.params.chartHeight);
        },

        getTooltipConfig: function( dataItem ) {
            var self = this,
                formattedData = {};
            _.each(dataItem, function(value, key) {
                if( _.has(self.params.accessorData[key], "tooltip") ) {
                    var formattedKey = key,
                        formattedVal = value;
                    if( _.has(self.params.accessorData[key].tooltip, "nameFormatter") )
                        formattedKey = self.params.accessorData[key].tooltip.nameFormatter( key );
                    if( _.has(self.params.accessorData[key].tooltip, "valueFormatter") )
                        formattedVal = self.params.accessorData[key].tooltip.valueFormatter( value );
                    formattedData[formattedKey] = formattedVal;
                }
            });
            var tooltipConfig = self.params.getTooltipTemplateConfig( formattedData );
            return tooltipConfig;
        },

        hasAxisConfig: function( axisName, axisConfigParam ) {
            var self = this;
            return _.isObject( self.params.axis ) && _.isObject( self.params.axis[axisName] ) && !_.isUndefined( self.params.axis[axisName][axisConfigParam] );
        },

        /**
         * Renders the axis.
         */
        renderAxis: function () {
            var self = this;
            var xAxis = d3.axisBottom( self.params.xScale )
                .tickSize( self.params.yRange[0] - self.params.yRange[1] + 2 * self.params.marginInner )
                .tickPadding( 5 )
                .ticks( self.params.xTicks );
            if( self.hasAxisConfig( 'x', 'formatter' ) ) {
                xAxis = xAxis.tickFormat( self.params.axis.x.formatter );
            }
            var svg = self.svgSelection().transition().ease( d3.easeLinear ).duration( self.params.duration );
            svg.select( ".axis.x-axis" ).call( xAxis );
            // X axis label
            var xLabelData = [];
            var xLabelMargin = 5;
            if( self.hasAxisConfig( 'x', 'labelMargin' ) ) {
                xLabelMargin = self.params.axis.x.labelMargin;
            }
            if( self.params.xLabel ) {
                xLabelData.push( self.params.xLabel );
            }
            var xAxisLabelSvg = self.svgSelection().select( ".axis.x-axis" ).selectAll( ".axis-label" ).data( xLabelData );
            xAxisLabelSvg.enter()
                .append( "text" )
                .attr( "class", "axis-label" )
                .merge( xAxisLabelSvg )//.transition().ease( d3.easeLinear ).duration( self.params.duration )
                .attr( "x", self.params.xRange[0] + (self.params.xRange[1] - self.params.xRange[0]) / 2 )
                .attr( "y", self.params.chartHeight - self.params.marginTop - xLabelMargin )
                .text( function( d ) { return d; } );
            xAxisLabelSvg.exit().remove();
            // We render the yAxis here because there may be multiple components for one axis.
            // The parent has aggregated information about all Y axis.
            var referenceYScale = null;
            var yLabelX = 0;
            var yLabelTransform = "rotate(-90)";
            console.log( "self.params.yAxisInfoArray: ", self.params.yAxisInfoArray );
            _.each( self.params.yAxisInfoArray, function( axisInfo ) {
                var yLabelMargin = 12;
                if( self.hasAxisConfig( axisInfo.name, 'labelMargin' ) ) {
                    yLabelMargin = self.params.axis[axisInfo.name].labelMargin
                }
                var scaleName = axisInfo.name + "Scale";
                yLabelX = 0 - self.params.marginLeft + yLabelMargin;
                yLabelTransform = "rotate(-90)";
                if( axisInfo.position == "right" ) {
                    yLabelX = self.params.chartWidth - self.params.marginLeft - yLabelMargin;
                    yLabelTransform = "rotate(90)";
                    axisInfo.yAxis = d3.axisRight( self.params[scaleName] )
                        .tickSize( (self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner) )
                        .tickPadding( 5 ).ticks( self.params.yTicks );
                }
                else {
                    axisInfo.yAxis = d3.axisLeft( self.params[scaleName] )
                        .tickSize( -(self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner) )
                        .tickPadding( 5 ).ticks( self.params.yTicks );
                }
                if( !referenceYScale ) {
                    referenceYScale = self.params[scaleName];
                }
                else {
                    // This is not the first Y axis so adjust the tick values to the first axis tick values.
                    var referenceTickValues = _.map( referenceYScale.ticks( self.params.yTicks ), function( tickValue ) {
                        return axisInfo.yAxis.scale().invert( referenceYScale( tickValue ) );
                    });
                    axisInfo.yAxis = axisInfo.yAxis.tickValues( referenceTickValues );
                }
                if( self.hasAxisConfig( axisInfo.name, 'formatter' ) ) {
                    axisInfo.yAxis = axisInfo.yAxis.tickFormat( self.params.axis[axisInfo.name].formatter );
                }
                svg.select( ".axis.y-axis." + axisInfo.name + "-axis" ).call( axisInfo.yAxis );
                // Y axis label
                var yLabelData = [];
                var i = 0;
                // There will be one label per unique accessor label displayed on this axis.
                _.each( axisInfo.accessors, function( key ) {
                    if( self.params.activeAccessorData[key].label ) {
                        var foundYLabelData = _.findWhere( yLabelData, { label: self.params.activeAccessorData[key].label } );
                        if( !foundYLabelData ) {
                            var yLabelXDelta = 12 * i;
                            if( axisInfo.position == "right" ) {
                                yLabelXDelta = -yLabelXDelta;
                            }
                            yLabelData.push( { label: self.params.activeAccessorData[key].label, x: yLabelX + yLabelXDelta } );
                            i++;
                        }
                    }
                });
                var yAxisLabelSvg = self.svgSelection().select( ".axis.y-axis." + axisInfo.name + "-axis" ).selectAll( ".axis-label" ).data( yLabelData, function( d ) { return d.label; } );
                yAxisLabelSvg.enter()
                    .append( "text" )
                    .attr( "class", "axis-label" )
                    .merge( yAxisLabelSvg )//.transition().ease( d3.easeLinear ).duration( self.params.duration )
                    //.attr( "x", yLabelX )
                    //.attr( "y", self.params.yRange[1] + (self.params.yRange[0] - self.params.yRange[1]) / 2 )
                    .attr( "transform", function( d ) { return "translate(" + d.x + "," + (self.params.yRange[1] + (self.params.yRange[0] - self.params.yRange[1]) / 2) + ") " + yLabelTransform; } )
                    .text( function( d ) { return d.label; } );
                yAxisLabelSvg.exit().remove();
            });
        },

        renderData: function () {
            var self = this;
            _.each( self.components, function( component ) {
                component.renderData();
            });
        },

        onMouseOver: function( dataItem, x, y ) {
            var self = this;
            self.eventObject.trigger( "showTooltip", dataItem, self.getTooltipConfig(dataItem), x, y );
        },

        onMouseOut: function( dataItem, x, y ) {
            var self = this;
            self.eventObject.trigger( "hideTooltip", dataItem, x, y );
        },

        startEventListeners: function() {
            var self = this;
            _.each( self.components, function( component ) {
                self.listenTo( component.eventObject, "mouseover", self.onMouseOver );
                self.listenTo( component.eventObject, "mouseout", self.onMouseOut );
            });
        },

        dataModelChanged: function() {
            this.render();
        },

        configModelChanged: function() {
            this.render();
        },

        actualRender: function () {
            var self = this;
            console.log( "CompositeYChartView render start." );
            self.updateChildComponents();
            self.resetParams();
            self.calculateActiveAccessorData();
            self.calculateDimmensions();
            self.calculateScales();
            self.renderSVG();
            self.renderAxis();
            self.renderData();
            self.startEventListeners();
            console.log( "CompositeYChartView render end: ", self );
            self.eventObject.trigger( "rendered" );
        },

        render: function () {
            var self = this;
            if( self.config ) {
                self.debouncedRenderFunction();
            }
            return self;
        }
    });

    return CompositeYChartView;
});
