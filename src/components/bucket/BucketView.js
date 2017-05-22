/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ChartView from 'chart-view'
import Config from './BucketConfigModel'
import actionman from 'core/Actionman'
import ToggleVisibility from '../../actions/ToggleVisibility'
import ClusterAction from './actions/Cluster'
import {hashCode} from '../../core/Util'
import Cluster from './Cluster'
import './bucket.scss'

export default class BucketView extends ChartView {
  static get Config () { return Config }
  static get isMaster () { return false }
  static get Actions () { return {ToggleVisibility, ClusterAction} }

  get tagName () { return 'g' }

  get zIndex () { return 2 }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.bucket',
      active: '.active',
      label: '.bucket-label',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click node': '_onClickNode',
      'mouseover node': '_onMouseover',
      'mouseout node': '_onMouseout',
    })
  }

  render () {
    if (!this.el.parentElement) {
      super.render()
      this.svg.delegate('click', 'svg', this._onBackgroundClick.bind(this))
      this.d3.attr('clip-path', `url(#${this.config.get('clip')})`)
    }

    const data = this._cluster(this.model.data)

    const buckets = this.d3.selectAll(this.selectors.node)
      .data(data, d => d.id)

    const shape = this.config.get('shape')
    const color = this.config.get('color')
    const scale = this.config.scale
    const groups = buckets.enter()
      .append('g')
      .classed(this.selectorClass('node'), true)
      .classed(this.selectorClass('interactive'), true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
    groups
      .append('text')
      .html(shape)
      .attr('fill', color)
      .style('font-size', d => Math.sqrt(scale(d.area)))

    groups
      .append('text')
      .attr('class', this.selectorClass('label'))
      .text(d => d.bucket.length)
    // Update
    buckets
      .transition().ease(d3Ease.easeLinear).duration(this.config.duration)
      .attr('transform', d => `translate(${d.x},${d.y})`)

    buckets.exit().remove()

    this._ticking = false
  }

  _cluster (data) {
    const cluster = new Cluster()
    cluster
      .x(d => d.x)
      .y(d => d.y)
      .data(data)
    const buckets = cluster.buckets()

    _.each(buckets, d => {
      d.id = this._getId(d)
      d.area = this._getSize(d)
    })
    this.config.scale
      .domain(d3Array.extent(buckets, d => d.area))

    actionman.fire('Cluster', this.config.get('update'), cluster.overlapping())
    return buckets
  }

  _getId (bucket) {
    const summaryId = _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.id
      return sum
    }, '')
    return hashCode(summaryId)
  }

  _getSize (bucket) {
    return _.reduce(bucket.bucket, (sum, datum) => {
      sum += datum.area
      return sum
    }, 0)
  }

  // Event handlers

  _onMouseover (d, el, event) {
    const tooltip = this.config.get('tooltip')
    if (tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      const config = {left, top, container: this._container}
      actionman.fire('ToggleVisibility', tooltip, true, d.bucket, config)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d, el) {
    const tooltip = this.config.get('tooltip')
    if (tooltip) {
      actionman.fire('ToggleVisibility', tooltip, false)
    }
    const els = el ? this.d3.select(() => el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }

  _onClickNode (d, el, e) {
    e.stopPropagation()
    this._onMouseout(d, el)
    const ranges = {}
    _(d.bucket).map('accessor.accessor')
      .uniq()
      .push(this.config.get('xAccessor'))
      .each(accessor => {
        ranges[accessor] = d3Array.extent(_.map(d.bucket, 'data.' + accessor))
      })
    actionman.fire('Zoom', this.config.get('update'), ranges)
  }

  _onBackgroundClick () {
    actionman.fire('Zoom')
  }
}
