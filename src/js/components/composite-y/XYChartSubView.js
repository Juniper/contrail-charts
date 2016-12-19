/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var XYChartSubView = ContrailChartsView.extend({

  initialize: function (options) {
    var self = this
    self.config = options.config
    self.parent = options.parent
    self.axisName = options.axisName
    self.eventObject = options.eventObject || _.extend({}, Events)
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
    var xScale = this.getXScale()
    return xScale(dataElem[xAccessor])
  },

  getScreenY: function (dataElem, yAccessor) {
    var yScale = this.getYScale()
    return yScale(dataElem[yAccessor])
  }
})

module.exports = XYChartSubView
