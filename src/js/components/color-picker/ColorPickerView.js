/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var ColorPickerView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-color-picker-view',

  initialize: function (options) {
    var self = this
    self.show = 0
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  generateColorPickerHTML: function (accessors) {
    var fnGenerateColorPickerHTML = this.config.get('generateColorPickerHTML')
    return fnGenerateColorPickerHTML(accessors)
  },

  _renderColorPicker: function (sourceParams, sourceConfig) {
    var self = this
    var accessors = sourceParams.plot.y
    self.$el.html(self.generateColorPickerHTML(accessors))
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self.eventObject)
    // We assume that when the sourceComponent is rendered it triggers the 'rendered:[componentName]' event passing (sourceParams, sourceConfig) as arguments.
    // We assume that these are the params of a CompositeY chart.
    // TODO: How to handle params from different components (ie. Radial)?
    // They can have a different structure then the 'plot' and 'axis' config attributes in CompositeY.
    self.listenTo(self.eventObject, 'rendered:' + self.params.sourceComponent, self._renderColorPicker)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = ColorPickerView
