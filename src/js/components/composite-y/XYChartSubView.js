/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsView = require('contrail-charts-view')

const XYChartSubView = ContrailChartsView.extend({

  initialize: function (options) {
    ContrailChartsView.prototype.initialize.call(this, options)
    this.parent = options.parent
    this.axisName = options.axisName
  },
  /**
  * Returns the unique name of this drawing so it can identify itself for the parent.
  * The drawing's name is of the following format: [axisName]-[chartType] ie. "y1-line".
  */
  getName: function () {
    return this.axisName + '-' + this.chartType
  },

  getYScale: function () {
    return this.params.axis[this.axisName].scale
  },

  getXScale: function () {
    return this.params.axis[this.params.plot.x.axis].scale
  },

  getColor: function (accessor) {
    return accessor.color
  },

  getScreenX: function (dataElem, xAccessor) {
    const xScale = this.getXScale()
    return xScale(dataElem[xAccessor])
  },

  getScreenY: function (dataElem, yAccessor) {
    const yScale = this.getYScale()
    return yScale(dataElem[yAccessor])
  },

  enableTooltip: function () {
    this._tooltipEnabled = true
  },

  disableTooltip: function () {
    this._tooltipEnabled = false
  },
})

module.exports = XYChartSubView
