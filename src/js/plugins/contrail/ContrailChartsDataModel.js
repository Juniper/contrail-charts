/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailModel = require('contrail-model')

/**
 * Base data model.
 */
var ContrailChartsDataModel = ContrailModel.extend({
  defaults: {
    // / The formatted data
    data: [],

    // to Save the current state of data fetching
    // Todo: integrate properly with ContrailListModel remoteDataHandler.
    dataStatus: undefined,

    // / The current data query limits. For example the data limits set on a query that returned this data.
    // / example: limit: { x: [0, 100] }
    limit: {}
  },

  getData: function () {
    return this.get('data')
  },

  setData: function (data) {
    if (_.isFunction(this.get('dataParser'))) {
      data = this.get('dataParser')(data)
    }
    this.set({data: data})
  },

  getQueryLimit: function () {
    return this.get('limit')
  },

  setQueryLimit: function (limit) {
    // Simulate a query. The provided limit should be used to retreive a new data chunk.
    var self = this
    setTimeout(function () {
      self.set({data: self.getData(), limit: limit})
    }, 1000)
  },

  // Formatter prepares the raw data. Try to avoid additional formatting on view level.
  // Navigation
  // Tooltip
  // Selection for field x and y
  // Formatter config for each field available in the data model
  // Control panel - crop and zoom, reset zoom
  // Bucketization

  // Helper functions - no need to implement in an actual DataModel.
  // However an actual DataModel would require some functions to fetch data.

  setDataAndLimit: function (data, limit) {
    this.setData(data)
    this.set({limit: limit})
  }
})

module.exports = ContrailChartsDataModel
