/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var $ = require('jquery')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var ColorPickerView = ContrailChartsView.extend({
  type: 'colorPicker',
  tagName: 'div',
  className: 'coCharts-color-picker-view',

  initialize: function (options) {
    var self = this
    self.show = 0
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  events: {
    'click .color-select': 'openColorPalette',
    'click .color-picker-palette-close': 'closeColorPalette',
    'click .color-picker-palette-color': 'selectColor'
  },

  generateColorPickerHTML: function (accessors) {
    var fnGenerateColorPickerHTML = this.config.get('generateColorPickerHTML')
    return fnGenerateColorPickerHTML.bind(this.config)(accessors)
  },

  openColorPalette: function (e) {
    var self = this
    var $elem = $(e.target).closest('.color-select')
    var accessor = _.find(self.accessors, function (a) { return a.accessor === $elem.attr('data-accessor') })
    if (!accessor) {
      return
    }
    self.accessor = accessor
    self.closeColorPalette()
    var $paletteContainer = $('<div class="color-picker-palette"></div>')
    var $paletteTitle = $('<div class="color-picker-palette-header"></div>')
    $paletteTitle.append('<span class="color-picker-palette-title">' + self.config.getLabel(undefined, accessor) + '</span>')
    $paletteTitle.append('<span class="color-picker-palette-close"><i class="fa fa-remove"/></span>')
    $paletteContainer.append($paletteTitle)
    var $paletteBody = $('<div class="color-picker-palette-body"></div>')
    _.each(self.params.palette, function (color) {
      $paletteBody.append('<span class="color-picker-palette-color" style="background-color: ' + color + '">&nbsp;</span>')
    })
    $paletteContainer.append($paletteBody)
    var elemOffset = $elem.position()
    elemOffset.left += 155
    $paletteContainer.offset(elemOffset)
    self.$el.append($paletteContainer)
  },

  closeColorPalette: function () {
    this.$el.find('.color-picker-palette').remove()
  },

  selectColor: function (e) {
    var self = this
    var $elem = $(e.target).closest('.color-picker-palette-color')
    var color = $elem.css('background-color')
    self.eventObject.trigger('selectColor', self.accessor.accessor, color)
  },

  _renderColorPicker: function (sourceParams, sourceConfig) {
    var self = this
    self.accessors = sourceParams.plot.y
    self.sourceConfig = sourceConfig
    self.$el.html(self.generateColorPickerHTML(self.accessors))
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
