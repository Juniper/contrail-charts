/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')

var XYChartSubView = ContrailChartsView.extend({

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self.parent = options.parent
    self.axisName = options.axisName
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
  }
})

module.exports = XYChartSubView
