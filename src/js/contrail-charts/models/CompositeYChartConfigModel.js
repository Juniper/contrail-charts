/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery", "underscore", "d3",
    "contrail-charts/models/ContrailChartsConfigModel"
], function( $, _, d3, ContrailChartsConfigModel ) {
    var CompositeYChartConfigModel = ContrailChartsConfigModel.extend({
        defaults: {
            /// The chart width. If not provided will be caculated by View.
            chartWidth: undefined,

            /// The chart height. If not provided will be caculated by View.
            chartHeight: undefined,

            /// Duration of chart transitions.
            duration: 300,

            xTicks: 10,
            yTicks: 10,

            /// General margin used for computing the side margins.
            margin: 5,

            /// Side margins. Will be computed if undefined.
            marginTop: undefined,
            marginBottom: undefined,
            marginLeft: undefined,
            marginRight: undefined,
            marginInner: undefined,

            /// Scales can be provided as a d3 scale or undefined if they need to be calculated.
            xScale: undefined,
            xDomain: undefined,

            /// Axis can be provided as a d3 axis or true if they need to be calculated.
            axisTop: false,
            axisBottom: true,
            axisLeft: true,
            axisRight: false,

            // Titles
            titleTop: undefined,
            titleBottom: undefined,
            titleLeft: undefined,
            titleRight: undefined,

            // x variable name
            xAccessor: "x",
            curve: d3.curveCatmullRom.alpha( 0.5 ),

            //Tooltip content & config specific callback
            getTooltipTemplateConfig: function( data ) {
                var tooltipConfig = {
                    title: { name: data.name || "", type: data.type || "" },
                    content: { iconClass: false, info: [] },
                    dimension: { width: 250 }
                };
                _.each(data, function(value, key) {
                    tooltipConfig.content.info.push({label: key, value: value});
                });
                return tooltipConfig;
            }
        }
    });

    return CompositeYChartConfigModel;
});
