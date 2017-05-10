/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ChartView from 'chart-view'
import Config from './ColorPickerConfigModel'
import actionman from 'core/Actionman'
import ToggleVisibility from '../../actions/ToggleVisibility'
import _template from './color-picker.html'
import './color-picker.scss'

export default class ColorPickerView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return {ToggleVisibility} }

  get selectors () {
    return _.extend(super.selectors, {
      open: '.color-select',
      close: '.color-picker-palette-close',
      title: '.color-picker-palette-title',
      palette: '.color-picker-palette',
      colorSelector: '.color-picker-palette-color',
    })
  }

  get events () {
    return {
      'click open': 'open',
      'click close': 'close',
      'click colorSelector': '_onSelectColor',
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
    const paletteElement = this.$(this.selectors.palette)
    const elemOffset = $elem.position()
    elemOffset.left += $elem.outerWidth(true)
    paletteElement.css(elemOffset)
    paletteElement.find(this.selectors.title).html(label)
    paletteElement.removeClass('hide')
  }

  close () {
    this.d3.select(this.selectors.palette).classed('hide', true)
  }

  // Event handlers

  _onSelectColor (d, el) {
    const color = el.style['background-color']
    actionman.fire('SelectColor', this._accessor, color)
  }
}
