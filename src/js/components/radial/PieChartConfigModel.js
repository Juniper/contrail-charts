/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var PieChartConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    // The chart width. If not provided will be caculated by View.
    chartWidth: undefined,

    // / The chart height. If not provided will be caculated by View.
    chartHeight: undefined,

    colorScale: d3.scaleOrdinal(d3.schemeCategory20),
  },

  getColor: function (accessor) {
    var self = this
    return self.attributes.colorScale(accessor)
  },
})

module.exports = PieChartConfigModel
