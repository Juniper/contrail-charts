/** Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. 
 * Handler for single serie data type 
 */ 
var _ = require('lodash') 
var ContrailModel = require('contrail-model') 
 
var SerieProvider = ContrailModel.extend({ 
  defaults: { 
    _type: 'SerieProvider', 
  }, 
 
  initialize: function (options) {
    var self = this
    if (self.has('parent')) {
      self.listenTo(self.get('parent'), 'change', self.parse)
    }
    self.parse()

    self.listenTo(self, 'change:error', self.triggerError)
  },

  parse: function () {
    var self = this
    self.set('data', self.get('parent').getData())
  },

  getValue: function (data, datumConfig) { 
    var self = this 
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
    var formatter = datumConfig.formatter 
    var value = self.getValue(data, datumConfig) 
    if (_.isFunction(formatter)) return formatter(value) 
    return value 
  },
  /** 
   * @param {Array} data extract label from data source 
   * @param {Object} datumConfig config on how to extract label from data data 
   */ 
  getLabel: function (data, datumConfig) { 
    var self = this 
    var getLabel = datumConfig.labelFormatter 
    if (_.isNil(data)) return undefined 
    if (_.isFunction(getLabel)) return getLabel(data) 
    if (_.isString(getLabel)) return getLabel
  }, 

  getLabels: function (formatter) { 
    var self = this
    return _.map(self.get('data'), function (serie) {
      return formatter(serie)
    })
  }, 
}) 
 
module.exports = SerieProvider
