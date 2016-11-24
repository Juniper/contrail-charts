/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var NavigationConfigModel = ContrailChartsConfigModel.extend({
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

    curve: d3.curveCatmullRom.alpha(0.5),

    // The selection to use when first rendered [xMin, xMax].
    selection: undefined
  }
})

module.exports = NavigationConfigModel
