/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery', 'underscore', 'd3',
  'contrail-charts/base/ContrailChartsConfigModel'
], function ($, _, d3, ContrailChartsConfigModel) {
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

  return PieChartConfigModel
})
