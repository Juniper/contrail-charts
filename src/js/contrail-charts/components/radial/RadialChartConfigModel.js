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

    //initialize: function (config) {
      //var self = this
      //self.set('radius', Math.min(width, height) / 2;)
    //},
  }
})

module.exports = PieChartConfigModel
