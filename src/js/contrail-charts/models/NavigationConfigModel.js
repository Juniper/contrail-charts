/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery",
    "underscore",
    "contrail-charts/models/ContrailChartsConfigModel"
], function( $, _, ContrailChartsConfigModel ) {
    var NavigationConfigModel = ContrailChartsConfigModel.extend({
        defaults: {

            chartWidth: undefined,
            chartHeight: 200,

            duration: 100,

            xTicks: 10,
            yTicks: 2,

            margin: 5,

            marginTop: undefined,
            marginBottom: undefined,
            marginLeft: undefined,
            marginRight: undefined,

            xScale: undefined,
            yScale: undefined,
            rScale: undefined,

            axisTop: false,
            axisBottom: true,
            axisLeft: true,
            axisRight: false,

            titleTop: undefined,
            titleBottom: undefined,
            titleLeft: undefined,
            titleRight: undefined,

            _y1Chart: "line",
            _y2Chart: "line",
            _enableXAxis: "line",

            xAccessor: "x",
            accessorData: {},

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

    return NavigationConfigModel;
});
