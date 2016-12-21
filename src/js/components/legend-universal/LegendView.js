/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')
var _template = require('./legend.html')

var Self = ContrailChartsView.extend({
  type: 'legendUniversal',
  tagName: 'div',
  className: 'coCharts-legend-view',

  initialize: function (options) {
    var self = this
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.listenTo(self.model, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    var template = self.config.get('template') || _template
    var content = $(template(self.config.getData(self.model)))
    self.$el.html(content)
  }
})

module.exports = Self
