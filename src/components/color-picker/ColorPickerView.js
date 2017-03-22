/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './color-picker.scss'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import _template from './color-picker.html'

export default class ColorPickerView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
  }

  get events () {
    return {
      'click .color-select': 'open',
      'click .color-picker-palette-close': 'close',
      'click .color-picker-palette-color': '_onSelectColor',
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
    this.d3.classed('hide', this.config.get('embedded') && !this._visible)
  }

  open (d, el) {
    const $elem = this.$(el)
    const label = $elem.find('.label').html()
    this._accessor = $elem.data('accessor')
    const paletteElement = this.$('.color-picker-palette')
    const elemOffset = $elem.position()
    elemOffset.left += $elem.outerWidth(true)
    paletteElement.css(elemOffset)
    paletteElement.find('.color-picker-palette-title').html(label)
    paletteElement.removeClass('hide')
  }

  close () {
    this.d3.select('.color-picker-palette').classed('hide', true)
  }

  // Event handlers

  _onSelectColor (d, el) {
    const color = el.style['background-color']
    actionman.fire('SelectColor', this._accessor, color)
  }
}
