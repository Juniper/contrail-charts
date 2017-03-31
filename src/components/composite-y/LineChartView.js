/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import {interpolatePath as d3InterpolatePath} from 'd3-interpolate-path'
import 'd3-transition'
import * as d3Shape from 'd3-shape'
import * as d3Ease from 'd3-ease'
import * as d3Scale from 'd3-scale'
import XYChartSubView from 'components/composite-y/XYChartSubView'
import actionman from 'core/Actionman'
import './line-chart.scss'

export default class LineChartView extends XYChartSubView {
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
   * Draw one line (path) per each Y accessor.
   */
  render () {
    super.render()
    const data = this.model.data
    const xAccessor = this.config.get('plot.x.accessor')

    // Collect linePathData - one line per Y accessor.
    const linePathData = []
    this._lines = {}

    _.each(this.params.activeAccessorData, accessor => {
      const key = accessor.accessor
      this._lines[key] = d3Shape.line()
        .x(d => this.xScale(_.get(d, xAccessor)))
        .y(d => this.yScale(_.get(d, key)))
        .curve(this.config.get('curve'))
      linePathData.push({ key: key, accessor: accessor, data: data })
    })
    const svgLines = this.d3.selectAll(this.selectors.node)
      .data(linePathData, d => d.key)

    svgLines.enter().append('path')
      .attr('class', d => 'line line-' + d.key)
      .attr('d', d => this._lines[d.key](d.data[0]))
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attrTween('d', this._interpolate.bind(this))
      .attr('stroke', d => this.config.getColor(d.data, d.accessor))

    svgLines
      .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attrTween('d', (d, i, els) => {
        const previous = els[i].getAttribute('d')
        const current = this._lines[d.key](d.data)
        return d3InterpolatePath(previous, current)
      })
      .attr('stroke', d => this.config.getColor(d.data, d.accessor))
    svgLines.exit().remove()
  }
  /**
   * Draw line along the path
   */
  _interpolate (d) {
    const interpolate = d3Scale.scaleQuantile()
      .domain([0, 1])
      .range(d3Array.range(1, d.data.length + 1))

    return (t) => {
      const interpolatedLine = d.data.slice(0, interpolate(t))
      return this._lines[d.key](interpolatedLine)
    }
  }

  // Event handlers

  _onMouseover (d, el) {
    if (d.accessor.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      const xAccessor = this.config.get('plot.x.accessor')
      const xVal = this.xScale.invert(left)
      const dataItem = this.model.getNearest(xAccessor, xVal)
      actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, dataItem)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
