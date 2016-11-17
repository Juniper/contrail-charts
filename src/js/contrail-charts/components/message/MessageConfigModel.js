/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var MessageConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    messages: [],

    _showOnceMessageIds: [],

    noDataMessage: 'No Data Found',

    showDataStatusMessage: true,

    statusMessageHandler: undefined
  }
})

module.exports = MessageConfigModel
