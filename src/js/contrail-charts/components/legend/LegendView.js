/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var LegendView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-legend-view',

  initialize: function (options) {
    var self = this
    self.show = 0
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  generateLegendHTML: function (accessors) {
    var fnGenerateLegendHTML = this.config.get('generateLegendHTML')
    return fnGenerateLegendHTML(accessors)
  },

  _renderLegend: function (sourceParams) {
    var self = this
    var accessors = sourceParams.plot.y
    self.$el.html(self.generateLegendHTML(accessors))
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self.eventObject)
    self.listenTo(self.eventObject, 'rendered:' + self.params.sourceComponent, self._renderLegend)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = LegendView
