/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
*/
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var CompositeYChartConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    // / The chart width. If not provided will be caculated by View.
    chartWidth: undefined,

    // / The difference by how much we want to modify the computed width.
    chartWidthDelta: undefined,

    // / The chart height. If not provided will be caculated by View.
    chartHeight: undefined,

    colorScale: d3.scaleOrdinal(d3.schemeCategory20),
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

    curve: d3.curveCatmullRom.alpha(0.5)
  },

  getColor: function (accessor) {
    if (_.has(accessor, 'color')) {
      return accessor.color
    } else {
      return this.attributes.colorScale(accessor.accessor)
    }
  },

  getAccessors: function () {
    return this.get('plot').y
  },
  /**
   * Enable / disable event triggering with data preperation for specified component
   * @param {String} type Component type
   * @param {Boolean} enable Change state of this component
   */
  toggleComponent: function (type, enable) {
    switch (type) {
      case 'tooltip':
        if (!this.attributes.crosshairEnabled) this.set('tooltipEnabled', enable)
        break
      case 'crosshair':
        this.set('tooltipEnabled', !enable)
        this.set('crosshairEnabled', enable)
        break
      default:
        break
    }
  },
})

module.exports = CompositeYChartConfigModel
