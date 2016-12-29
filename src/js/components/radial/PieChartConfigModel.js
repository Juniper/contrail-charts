/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var PieChartConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    type: 'pie',
    // The chart width. If not provided will be caculated by View.
    chartWidth: undefined,

    // / The chart height. If not provided will be caculated by View.
    chartHeight: undefined,

    colorScale: d3.scaleOrdinal(d3.schemeCategory20),
  },

  getColor: function (accessor) {
    return this.attributes.colorScale(accessor)
  },

  getLabels: function (dataProvider) {
    var labelFormatter = this.get('serie').getLabel
    return dataProvider.getLabels(labelFormatter)
  },

  getInnerRadius: function () {
    const chartType = this.get('type')
    const innerRadiusCoefficient = chartType === 'pie' ? 0 : 0.75
    return this.get('radius') * innerRadiusCoefficient
  },

})

module.exports = PieChartConfigModel
