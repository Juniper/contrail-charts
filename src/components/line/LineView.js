/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import 'd3-transition'
import * as d3Shape from 'd3-shape'
import * as d3Ease from 'd3-ease'
import * as d3Scale from 'd3-scale'
import {interpolatePath as d3InterpolatePath} from 'd3-interpolate-path'
import ContrailChartsView from 'contrail-charts-view'
import Config from './LineConfigModel'
import actionman from 'core/Actionman'
import './line.scss'

export default class LineView extends ContrailChartsView {
  static get Config () { return Config }
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }

  get zIndex () { return 3 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.line',
    })
  }

  get events () {
    return {
      'mouseover node': '_onMouseover',
      'mouseout node': '_onMouseout',
    }
  }
  /**
   * Draw a line path
   */
  render () {
    super.render()
    const data = this.model.data
    const xAccessor = this.config.get('x.accessor')
    const accessor = this.config.get('y')
    const key = accessor.accessor
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)

    this._line = d3Shape.line()
      .x(d => this.config.xScale(_.get(d, xAccessor)))
      .y(d => this.config.yScale(_.get(d, key)))
      .curve(this.config.get('curve'))

    const linePath = this.d3.selectAll(this.selectors.node)
      .data(_.isEmpty(data) ? [] : [accessor], d => d.accessor)

    linePath.enter().append('path')
      .attr('class', 'line line-' + key)
      .attr('d', this._line(data[0] || 0))
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attrTween('d', this._interpolate.bind(this, data, key))
      .attr('stroke', this.config.getColor(data, accessor))

    linePath
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attrTween('d', (d, i, els) => {
        const previous = els[i].getAttribute('d')
        const current = this._line(data)
        return d3InterpolatePath(previous, current)
      })
      .attr('stroke', this.config.getColor(data, accessor))
    linePath.exit().remove()

    this._ticking = false
  }
  /**
   * Draw line along the path
   */
  _interpolate (data, key) {
    const interpolate = d3Scale.scaleQuantile()
      .domain([0, 1])
      .range(d3Array.range(1, data.length + 1))

    return t => {
      const interpolatedLine = data.slice(0, interpolate(t))
      return this._line(interpolatedLine)
    }
  }

  // Event handlers

  _onMouseover (d, el) {
    if (d.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      const xAccessor = this.config.get('x.accessor')
      const xVal = this.config.xScale.invert(left)
      const dataItem = this.model.getNearest(xAccessor, xVal)
      actionman.fire('ToggleVisibility', d.tooltip, true, {left, top}, dataItem)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d = {}, el) {
    const tooltipId = d.tooltip || this.config.get('y.tooltip')
    if (!_.isEmpty(tooltipId)) actionman.fire('ToggleVisibility', tooltipId, false)

    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
