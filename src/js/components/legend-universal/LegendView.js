/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')
var _template = require('./legend.html')

var Self = ContrailChartsView.extend({
  type: 'legendUniversal',
  className: 'coCharts-legend-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self.listenTo(self.config, 'change', self.render)
    self.listenTo(self.model, 'change', self.render)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    var template = self.config.get('template') || _template
    var content = $(template(self.config.getData(self.model)))

    ContrailChartsView.prototype.render.call(self, content)
  }
})

module.exports = Self
