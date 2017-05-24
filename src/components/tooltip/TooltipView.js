// Copyright (c) Juniper Networks, Inc. All rights reserved.

import _ from 'lodash'
import ChartView from 'chart-view'
import Config from './TooltipConfigModel'
import ToggleVisibility from '../../actions/ToggleVisibility'
import TitleView from 'helpers/title/TitleView'
import _template from './tooltip.html'
import './tooltip.scss'

export default class TooltipView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return {ToggleVisibility} }
  static get isMaster () { return false }

  get width () { return this.el.offsetWidth }
  get height () { return this.el.offsetHeight }

  render () {
    if (!this._visible) return
    super.render()
    let {left, top} = this.config.position
    this._loadTemplate(this.model.data)
    this.d3.classed('active', true)

    if (this.config.get('sticky')) {
      // TODO do not make assumptions on source component internal structure
      const sourceRect = this.svg.node().querySelector('#' + this.config.clip).getBoundingClientRect()
      const containerRect = this._container.getBoundingClientRect()
      left = sourceRect.left - containerRect.left
      if (this.config.position.left > containerRect.width / 2) {
        left += this.config.stickyMargin.left
      } else {
        left += (sourceRect.width - this.config.stickyMargin.right - this.width)
      }
      top = sourceRect.top - containerRect.top + (sourceRect.height / 2 - this.height / 2)
    }
    this.place({left, top}, this.config.get('placement'))
    this.el.style.height = `${this.config.height}px`
  }

  hide () {
    this.d3.classed('active', false)
  }
  /**
   * Position tooltip box relative to the passed center point (usually cursor)
   * vertical and horizontal placement tries to keep the box within container
   */
  place (point, placement) {
    let {left, top} = point
    const margin = 10
    const containerWidth = this._container.offsetWidth
    const containerHeight = this._container.offsetHeight

    switch (placement) {
      case 'vertical':
        if (top - this.height - margin > 0) return this.place(point, 'top')
        else if (top + this.height + margin < containerHeight) return this.place(point, 'bottom')
        return this.place(point, 'center')
      case 'horizontal':
        if (left + this.width + margin < containerWidth) return this.place(point, 'right')
        else if (left - this.width - margin > 0) return this.place(point, 'left')
        return this.place(point, 'center')
      case 'top':
        left = left - this.width / 2
        top = top - this.height - margin
        break
      case 'bottom':
        left = left - this.width / 2
        top = top + margin
        break
      case 'left':
        left = left - this.width - margin
        top = top - this.height / 2
        break
      case 'right':
        left = left + margin
        top = top - this.height / 2
        break
      case 'center':
        left = left - this.width / 2
        top = top - this.height / 2
    }
    this.el.style.left = `${left}px`
    this.el.style.top = `${top}px`
  }

  _loadTemplate (data) {
    const template = this.config.get('template') || _template
    const tooltipContent = this.config.get('formatter').bind(this.config)(data)
    super.render(template(tooltipContent))
    // TODO Discuss if title needs to be handled via TitleView or using the tooltip template itself.
    if (!_.isNil(tooltipContent.title)) {
      TitleView(this.d3.select('.tooltip-content').node(), tooltipContent.title)
    }
  }
}
