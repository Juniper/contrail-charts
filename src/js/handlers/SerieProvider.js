/**
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
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

  getLabels: function (formatter) {
    var self = this
    return _.map(self.get('data'), function (serie) {
      return formatter(serie)
    })
  },
})

module.exports = SerieProvider
