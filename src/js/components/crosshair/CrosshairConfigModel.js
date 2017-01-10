/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const ContrailChartsConfigModel = require('contrail-charts-config-model')

/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYChartView.
*/
const CrosshairConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    duration: 100,
    bubbleR: 5,
  },
})

module.exports = CrosshairConfigModel
