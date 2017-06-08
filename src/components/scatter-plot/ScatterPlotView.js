/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import 'd3-transition'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ChartView from 'chart-view'
import Config from './ScatterPlotConfigModel'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import ClusterAction from '../bucket/actions/Cluster'
import Zoom from '../../actions/Zoom'
import './scatter-plot.scss'

export default class ScatterPlotView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {ClusterAction, Zoom} }

  get tagName () { return 'g' }

  get zIndex () { return 1 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.point',
    })
  }

  get events () {
    return {
      'mouseover node': '_onMouseover',
      'mouseout node': '_onMouseout',
    }
  }

  get isWaiting () {
    return this._waiting
  }
  // assume max shape extension out of scale range as of circle's radius
  get padding () {
    const maxR = Math.sqrt(this.config.get('size.range')[1])
    return {left: maxR, top: maxR, right: maxR, bottom: maxR}
  }

  calculateScales () {
    this.config.set('x.range', [this.padding.left, this.innerWidth - this.padding.right], {silent: true})
    this.config.set('y.range', [this.innerHeight - this.padding.bottom, this.padding.top], {silent: true})
    this.config.calculateScales(this.model)
  }

  render () {
    super.render()
    // just render points if was waiting on cluster result
    if (!this._waiting) {
      // frozen component is completely controlled from outside
      if (!this.config.get('frozen')) this.calculateScales()
      this._data = _.filter(this.prepareData(), d => !_.find(this._overlapping, {id: d.id}))

      // do not render points before it is known what of them to skip due to bucketization
      if (this._cluster()) return
    }
    let points = this.d3.selectAll(this.selectors.node)
      .data(this._data, d => d.id)

    const pointsEnter = points.enter()
      .append('g')
      .classed(this.selectorClass('node'), true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
    pointsEnter
      .append('circle')
    pointsEnter
      .append('text')

    const update = pointsEnter.merge(points)
    update.select('circle')
      .attr('r', d => Math.sqrt(d.area) / 2)
      .attr('fill', d => d.color)
    update.select('text')
      .attr('fill', d => d.color)
      .html(d => d.accessor.shape)
      .style('font-size', d => Math.sqrt(d.area / 4))

    // Update
    points
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x},${d.y})`)

    points.exit().remove()

    this._ticking = false
  }

  cluster (overlapping) {
    this._overlapping = overlapping
    this.render()
    this._waiting = false
  }

  zoom (ranges) {
    // TODO return if ranges didn't change
    ranges || (ranges = {
      [this.config.get('x.accessor')]: [],
      [this.config.get('y.accessor')]: [],
    })
    _.each(ranges, (range, accessor) => {
      const key = this.config.get('x.accessor') === accessor ? 'x' : 'y'
      this.config.set(key + '.domain', range, {silent: true})
    })

    this.render()
  }
  /**
   * Create a flat data structure
   */
  prepareData () {
    const xAccessor = this.config.get('x.accessor')
    const accessor = this.config.get('y')
    const key = accessor.accessor
    const sizeKey = this.config.get('size.accessor')
    const points = []

    _.map(this.model.data, d => {
      const x = _.get(d, xAccessor)
      if (!_.isNil(_.get(d, key))) { // key may not exist in all the data set.
        const obj = {
          id: x + '-' + key,
          x: this.config.xScale(x),
          y: this.config.yScale(_.get(d, key)),
          area: this.config.sizeScale(_.get(d, sizeKey)),
          color: this.config.getColor(accessor.accessor, d),
          accessor: accessor,
          data: d,
          halfWidth: Math.sqrt(this.config.sizeScale(_.get(d, sizeKey))) / 2,
          halfHeight: Math.sqrt(this.config.sizeScale(_.get(d, sizeKey))) / 2,
        }
        points.push(obj)
      }
    })
    return points
  }

  _cluster () {
    const bucketId = this.config.get('bucket')
    if (!bucketId) return false
    this._waiting = true

    const config = {
      update: this.id,
      xAccessor: this.config.get('x.accessor'),
    }
    return actionman.fire('ToggleVisibility', bucketId, true, this._data, config)
  }

  // Event handlers

  _onMouseover (d, el, event) {
    const tooltipId = this.config.get('tooltip')
    if (tooltipId) {
      const [left, top] = d3Selection.mouse(this._container)
      const tooltipConfig = {left, top, container: this._container}
      actionman.fire('ToggleVisibility', tooltipId, true, d.data, tooltipConfig)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d, el) {
    const tooltipId = this.config.get('tooltip')
    if (tooltipId) actionman.fire('ToggleVisibility', tooltipId, false)
    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
