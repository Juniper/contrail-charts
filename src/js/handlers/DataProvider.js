/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var ContrailModel = require('contrail-model')
var ContrailEvents = require('contrail-events')
/**
 * A DataModel wrapper for view components.
 * Handles:
 * - data range calculation for view components
 * - data filtering and chaining between components
 */
var DataProvider = ContrailModel.extend({
  defaults: {
    _type: 'DataProvider',

    // The formatted/filtered data
    data: [],

    // Function to format/filter data. Always applied on parentData
    formatData: undefined,

    // A lazy store of data ranges for which a range was calculated or for which the range was set manually.
    // example: { x: [0, 100], y: [20, 30], r: [5, 20] }
    range: {},

    // Ranges set manually on this data provider.
    manualRange: {},

    // This can be a DataModel or another DataProvider.
    // expected functions: getData(), getQueryLimit(), setQueryLimit()
    parentDataModel: undefined,

    error: false,

    // List or error objects with level and error message
    errorList: [],

    messageEvent: _.extend({}, ContrailEvents)
  },

  initialize: function (options) {
    // Listen for changes in the parent model.
    if (this.hasParentModel()) {
      this.listenTo(this.getParentModel(), 'change', this.prepareData)
    }
    this.prepareData()

    this.listenTo(this, 'change:error', this.triggerError)
  },

  getParentModel: function () {
    return this.get('parentDataModel')
  },

  hasParentModel: function () {
    return this.has('parentDataModel')
  },

  getData: function () {
    return this.get('data')
  },

  setData: function (data) {
    this.set({data: data})
  },

  getParentData: function () {
    var data
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getData)) {
      data = this.getParentModel().getData()
    } else {
      data = []
    }
    return data
  },

  getQueryLimit: function () {
    var queryLimit
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getQueryLimit)) {
      queryLimit = this.getParentModel().getQueryLimit()
    } else {
      queryLimit = {}
    }
    return queryLimit
  },

  /**
   * Calls the parent's setQueryLimit() function. In practice this will iterate down to the DataModel and should cause a data re-fetch with new limits.
   */
  setQueryLimit: function (queryLimit) {
    var self = this
    if (self.hasParentModel() && _.isFunction(self.getParentModel().setQueryLimit)) {
      self.getParentModel().setQueryLimit(queryLimit)
    }
    var range = self.getRange()
    _.each(queryLimit, function (queryRange, key) {
      delete range[key]
    })
  },

  getRange: function () {
    return this.get('range')
  },

  getManualRange: function () {
    return this.get('manualRange')
  },

  getRangeFor: function (variableName) {
    var range = this.getRange()
    if (!_.has(range, variableName)) {
      range[variableName] = this.calculateRangeForDataAndVariableName(this.getData(), variableName)
    }
    return range[variableName]
  },

  getParentRange: function () {
    var parentRange
    if (this.hasParentModel() && _.isFunction(this.getParentModel().getRange)) {
      parentRange = this.getParentModel().getRange()
    } else {
      parentRange = {}
    }
    return parentRange
  },

  setRange: function (range) {
    this.set({range: range})
  },

  /**
   * Sets the ranges and manual ranges for the variables provided in the newRange object.
   * Example: setRangeFor( { x: [0,100], y: [5,10] } )
   */
  setRangeFor: function (newRange) {
    var self = this
    var range = _.extend({}, self.getRange())
    var manualRange = _.extend({}, self.getManualRange())
    _.each(newRange, function (variableRange, variableName) {
      range[variableName] = variableRange
      manualRange[variableName] = variableRange
    })
    self.setRanges(range, manualRange)
  },

  resetRangeFor: function (newRange) {
    var self = this
    var range = _.extend({}, self.getRange())
    var manualRange = _.extend({}, self.get('manualRange'))
    _.each(newRange, function (variableRange, variableName) {
      delete range[variableName]
      delete manualRange[variableName]
    })
    self.setRanges(range, manualRange)
  },

  resetAllRanges: function () {
    this.setRanges({}, {})
  },

  setRangeAndFilterData: function (newRange) {
    var self = this
    self.setDataAndRanges(self.filterDataByRange(self.getParentData(), newRange), newRange, newRange)
  },

  /**
   * Worker function used to calculate a data range for provided varaible name.
   */
  calculateRangeForDataAndVariableName: function (data, variableName) {
    var variableRange
    var manualRange = this.get('manualRange')
    if (_.isArray(manualRange[variableName])) {
      // Use manually set range if available.
      variableRange = [manualRange[variableName][0], manualRange[variableName][1]]
    } else {
      // Otherwise calculate the range from data.
      if (data.length) {
        variableRange = d3.extent(data, function (d) { return d[variableName] })
      } else {
        // No data available so assume a [0..1] range.
        variableRange = [0, 1]
      }
    }
    return variableRange
  },

  setDataAndRanges: function (data, range, manualRange) {
    var self = this
    if (!data) {
      data = self.getParentData()
    }
    var formatData = self.get('formatData')
    if (_.isFunction(formatData)) {
      data = formatData(data, manualRange)
    }
    self.set({data: data, range: range, manualRange: manualRange})
  },

  filterDataByRange: function (data, range) {
    return _.filter(data, function (d) {
      var ok = true
      _.each(range, function (range, key) {
        if (!_.has(d, key)) {
          ok = false
        } else {
          if (d[key] < range[0] || d[key] > range[1]) {
            ok = false
          }
        }
      })
      return ok
    })
  },

  setRanges: function (range, manualRange) {
    var self = this
    // var data = self.getParentData()
    var data = self.getData()
    var formatData = self.get('formatData')
    if (!manualRange) {
      manualRange = self.get('manualRange')
    }
    if (_.isFunction(formatData)) {
      data = formatData(data, manualRange)
    }
    self.set({data: data, range: range, manualRange: manualRange})
  },

  /**
   * Take the parent's data and filter / format it.
   * Called on initialization and when parent data changed.
   */
  prepareData: function () {
    // Set the new data array and reset range - leave the manual range.
    this.setDataAndRanges(null, {}, {})
  },

  triggerError: function () {
    if (this.error) {
      this.messageEvent.trigger('error', {type: this._type, action: 'show', messages: this.errorList})
    } else {
      this.messageEvent.trigger('error', {type: this._type, action: 'hide'})
    }
  }
})

module.exports = DataProvider
