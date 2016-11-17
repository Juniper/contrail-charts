/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailModel = require('contrail-model')

var ContrailChartsConfigModel = ContrailModel.extend({
  initialize: function (options) {},

  /**
  * Initialize the computed parameters with the config parameters.
  */
  initializedComputedParameters: function () {
    this._computed = {}
    return _.extend(this._computed, JSON.parse(JSON.stringify(this.toJSON())))
  },

  initializedComputedParametersForChild: function (childIndex) {
    if (!_.isArray(this._computedForChild)) {
      this._computedForChild = []
    }
    this._computedForChild[childIndex] = {}
    return _.extend(this._computedForChild[childIndex], JSON.parse(JSON.stringify(this.toJSON())))
  }
})

module.exports = ContrailChartsConfigModel
