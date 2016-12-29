/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
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
  },

  getValue: function (data, datumConfig) {
    var getValue = datumConfig.accessor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getValue)) return getValue(data)
    if (_.isString(getValue)) return _.get(data, getValue)
    return data
  },
  /**
   * @param {Array} data extract label from data source
   * @param {Object} datumConfig config on how to extract label from data data
   */
  getFormattedValue: function (data, datumConfig) {
    var self = this
    var formatter = datumConfig.valueFormatter
    var value = self.getValue(data, datumConfig)
    if (_.isFunction(formatter)) return formatter(value)
    return value
  },
  /**
   * @param {Array} data extract label from data source
   * @param {Object} datumConfig config on how to extract label from data data
   */
  getLabel: function (data, datumConfig) {
    var getLabel = datumConfig.labelFormatter || datumConfig.label || datumConfig.accessor
    if (_.isString(getLabel)) return getLabel
    if (_.isNil(data)) return undefined
    if (_.isFunction(getLabel)) return getLabel(data)
  }
})

module.exports = ContrailChartsConfigModel
