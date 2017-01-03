/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./color-picker.html')

const ColorPickerView = ContrailChartsView.extend({
  type: 'colorPicker',
  tagName: 'div',
  className: 'coCharts-color-picker-view',

  events: {
    'click .color-select': 'open',
    'click .color-picker-palette-close': 'close',
    'click .color-picker-palette-color': 'selectColor',
  },

  initialize: function (options) {
    ContrailChartsView.prototype.initialize.call(this, options)
    this.listenTo(this.config, 'change', this.render)
  },

  render: function () {
    const template = this.config.get('template') || _template
    const content = $(template(this.config.getData()))

    ContrailChartsView.prototype.render.call(this, content)
  },

  open: function (e) {
    const $elem = $(e.currentTarget)
    const label = $elem.find('.label').html()
    this._accessor = $elem.data('accessor')
    const paletteElement = this.$('.color-picker-palette')
    const elemOffset = $elem.position()
    elemOffset.left += $elem.outerWidth(true)
    paletteElement.css(elemOffset)
    paletteElement.find('.color-picker-palette-title').html(label)
    paletteElement.show()
  },

  close: function () {
    this.$('.color-picker-palette').hide()
  },

  selectColor: function (e) {
    const $elem = $(e.currentTarget)
    const color = $elem.css('background-color')
    this._eventObject.trigger('selectColor', this._accessor, color)
  },
})

module.exports = ColorPickerView
