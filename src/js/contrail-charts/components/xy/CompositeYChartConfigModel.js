/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery', 'underscore', 'd3',
  'contrail-charts-config-model'
], function ($, _, d3, ContrailChartsConfigModel) {
  var CompositeYChartConfigModel = ContrailChartsConfigModel.extend({
    defaults: {
      // / The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // / The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // / The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      // / Duration of chart transitions.
      duration: 300,

      xTicks: 10,
      yTicks: 10,

      // / General margin used for computing the side margins.
      margin: 30,

      // / Side margins. Will be computed if undefined.
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      marginInner: undefined,

      /*
      // The y axis accessors.
      accessorData: {
          y: {                        // the variable name is the object key
              enable: true,           // is this accessor enabled, default: true
              y: 1,                   // the y axis to place the variable on (1: left, 2: right), default: 1
              chartType: 'line',      // the type of chart to draw for this accessor, no default
              possibleChartTypes: [{ name: "line", label: "Line" }, { name: "bar", label: "Grouped Bar" }, { name: "stackedBar", label: "Stacked Bar"}],
              tooltip: {
                  nameFormatter: function( key ) {
                      return "Memory Usage"
                  },
                  valueFormatter: function( value ) {
                      return formatBytes( value * 1024, false, 2, 3 )
                  }
              },
              label: "Memory Usage",
              color: "#d22",
              sizeAccessor: 'flowCnt',    // used in scatter bubble chart for the bubble size data accessor
              shape: 'circle'             // used in scatter bubble chart for bubble shape
          }
      },
      */

      /*
      axis: {
          x: {
              formatter: function( value ) {
                  return d3.time.format( "%H:%M" )( value )
              }
          },
          y1: {
              formatter: d3.format( ".01f" ),
              domain: [0, undefined],
              labelMargin: 5,
              scale: 'scalePow',      // the type of scale to use, default for x axis is d3.scaleTime(), default for y axis is d3.scaleLinear()
              nice: true
          },
          y2: {
              formatter: d3.format( ".01f" ),
              domain: [0, 10],
              labelMargin: 5,
              scale: 'scaleLinear',
              nice: true
          }
      },
      */

      curve: d3.curveCatmullRom.alpha(0.5),

      // Tooltip content & config specific callback
      getTooltipTemplateConfig: function (data) {
        var tooltipConfig = {
          title: { name: data.name || '', type: data.type || '' },
          content: { iconClass: false, info: [] },
          dimension: { width: 250 }
        }
        _.each(data, function (value, key) {
          tooltipConfig.content.info.push({ label: key, value: value })
        })
        return tooltipConfig
      }
    }
  })

  return CompositeYChartConfigModel
})
