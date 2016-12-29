/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')

var LegendView = ContrailChartsView.extend({
  type: 'legend',
  tagName: 'div',
  className: 'coCharts-legend-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self.show = 0
    self.listenTo(self.config, 'change', self.render)
  },

  generateLegendHTML: function (accessors) {
    var fnGenerateLegendHTML = this.config.get('generateLegendHTML')
    return fnGenerateLegendHTML.bind(this.config)(accessors)
  },

  _renderLegend: function (sourceParams) {
    var self = this
    var accessors = sourceParams.plot.y
    self.$el.html(self.generateLegendHTML(accessors))
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self._eventObject)
    self.listenTo(self._eventObject, 'rendered:' + self.params.sourceComponent, self._renderLegend)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = LegendView
