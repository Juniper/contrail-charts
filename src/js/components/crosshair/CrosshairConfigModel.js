/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var ContrailChartsConfigModel = require('contrail-charts-config-model')
var CrosshairConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    duration: 100,
    bubbleR: 5
  }
})

module.exports = CrosshairConfigModel
