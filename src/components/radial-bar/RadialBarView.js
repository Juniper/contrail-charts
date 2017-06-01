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
import ChartView from 'chart-view'
import Config from './RadialBarConfigModel'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import './radial-bar.scss'

export default class RadialBarView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }

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
      node: '.bar',
    })
  }

  get events () {
    return {
      'mouseover node': '_onMouseover',
      'mouseout node': '_onMouseout',
    }
  }

  get height () {
    return this.config.get('height') || this.width
  }

  get radius () {
    return Math.min(this.innerWidth, this.innerHeight) / 2
  }

  get bandWidth () {
    const data = this.model.data
    if (_.isEmpty(data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 100)
    // TODO do not use model.data.length as there can be gaps
    // or fill the gaps in it beforehand
    const angleScale = this.config.angleScale
    return (angleScale.range()[1] - angleScale.range()[0]) / data.length * paddedPart
  }

  /**
   * Draw radial bars
   */
  render () {
    super.render()
    const data = this.model.data
    const angleAccessor = this.config.get('angle.accessor')
    const accessor = this.config.get('r')
    const key = accessor.accessor
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)

    this.d3.attr('transform', `translate(${this.radius}, ${this.radius})`)

    // Create a flat data structure
    // TODO handle multiple accessors
    const numOfAccessors = 1
    const bandWidthHalf = this.bandWidth / 2
    this._innerBandScale = d3Scale.scaleBand()
      .domain(d3Array.range(numOfAccessors))
      .range([-bandWidthHalf, bandWidthHalf])
      .paddingInner(0.05)
      .paddingOuter(0.05)
    // Render the flat data structure
    const flatData = this._prepareData()
    const svgBarGroups = this.d3
      .selectAll(this.selectors.node)
      .data(flatData, d => d.id)
    svgBarGroups.enter().append('path')
      .attr('class', 'bar')
      .attr('d', this._createEnterRadialBarPath)
      .merge(svgBarGroups).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('fill', d => d.color)
      .attr('d', this._createRadialBarPath)
    svgBarGroups.exit().remove()

    this._ticking = false
  }

  _createRadialBarPath (d) {
    const halfPI = Math.PI / 2
    const x1 = Math.cos(d.angle - halfPI) * d.rStart
    const y1 = Math.sin(d.angle - halfPI) * d.rStart
    const x2 = Math.cos(d.angle - halfPI) * d.rEnd
    const y2 = Math.sin(d.angle - halfPI) * d.rEnd
    const x3 = Math.cos(d.angle + d.bandAngle - halfPI) * d.rEnd
    const y3 = Math.sin(d.angle + d.bandAngle - halfPI) * d.rEnd
    const x4 = Math.cos(d.angle + d.bandAngle - halfPI) * d.rStart
    const y4 = Math.sin(d.angle + d.bandAngle - halfPI) * d.rStart
    return `M${x1},${y1}L${x2},${y2}L${x3},${y3}L${x4},${y4}Z`
  }

  _createEnterRadialBarPath (d) {
    const halfPI = Math.PI / 2
    const x1 = Math.cos(d.angle - halfPI) * d.rStart
    const y1 = Math.sin(d.angle - halfPI) * d.rStart
    const x4 = Math.cos(d.angle + d.bandAngle - halfPI) * d.rStart
    const y4 = Math.sin(d.angle + d.bandAngle - halfPI) * d.rStart
    return `M${x1},${y1}L${x1},${y1}L${x4},${y4}L${x4},${y4}Z`
  }

  _prepareData () {
    const flatData = []
    const innerBandWidth = this._innerBandScale.bandwidth()
    const rAccessors = this.config.rAccessors
    _.each(this.model.data, d => {
      const angle = _.get(d, this.config.get('angle.accessor'))
      _.each(rAccessors, (rAccessor, j) => {
        const key = rAccessor.accessor
        const obj = {
          id: angle + '-' + key,
          angle: this.config.angleScale(angle) + this._innerBandScale(j),
          bandAngle: innerBandWidth,
          rStart: this.config.rScale.range()[0],
          rEnd: this.config.rScale(_.get(d, key)),
          color: this.config.getColor(rAccessor, d),
          data: d,
        }
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMouseover (d, el) {
    if (d.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      const angleAccessor = this.config.get('angle.accessor')
      const angleVal = this.config.angleScale.invert(left)
      const dataItem = this.model.getNearest(angleAccessor, angleVal)
      actionman.fire('ToggleVisibility', d.tooltip, true, {left, top}, dataItem)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d = {}, el) {
    const tooltipId = d.tooltip || this.config.get('r.tooltip')
    if (!_.isEmpty(tooltipId)) actionman.fire('ToggleVisibility', tooltipId, false)

    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
