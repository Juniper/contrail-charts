/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import 'd3-transition'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import Config from './ScatterPlotConfigModel'
import actionman from 'core/Actionman'
import BucketConfigModel from 'helpers/bucket/BucketConfigModel'
import BucketView from 'helpers/bucket/BucketView'
import './scatter-plot.scss'

export default class ScatterPlotView extends ContrailChartsView {
  static get Config () { return Config }
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    const bucketConfig = this.config.get('bucket')
    if (bucketConfig) {
      this._bucketConfigModel = new BucketConfigModel(bucketConfig)
      this._bucketConfigModel.set('clip', this._parent.clip)
      this._bucketConfigModel.parent = this.config
      this._bucketView = new BucketView({
        config: this._bucketConfigModel,
      })
    }
    this.listenTo(this.model, 'change', this.render)
  }

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

  render () {
    super.render()
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)

    const data = this._prepareData()
    if (this._bucketView) {
      this._bucketView.container = this._container
      this._bucketView.render(data)
    }

    let points = this.d3.selectAll(this.selectors.node)
      .data(data, d => d.id)

    points.enter()
      .append('text')
      .classed('point', true)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .merge(points)
      .html(d => d.accessor.shape)
      // overlap attribute is set in Bucket View
      .attr('fill', d => d.overlap ? 'none' : d.color)
      .style('font-size', d => Math.sqrt(d.area))

    // Update
    points
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x},${d.y})`)

    points.exit().remove()
    if (this._bucketView) this.svg.delegate('click', 'svg', this._onBackgroundClick.bind(this))

    this._ticking = false
  }
  /**
   * Create a flat data structure
   */
  _prepareData () {
    const xAccessor = this.config.get('x.accessor')
    const accessor = this.config.get('y')
    const points = []
    _.map(this.model.data, d => {
      const x = _.get(d, xAccessor)
      const key = accessor.accessor
      if (!_.isNil(_.get(d, key))) { // key may not exist in all the data set.
        const obj = {
          id: x + '-' + key,
          x: this.config.xScale(x),
          y: this.config.yScale(_.get(d, key)),
          area: this.config.sizeScale(_.get(d, accessor.sizeAccessor)),
          color: this.config.getColor(accessor.accessor, d),
          accessor: accessor,
          data: d,
          halfWidth: Math.sqrt(this.config.sizeScale(_.get(d, accessor.sizeAccessor))) / 2,
          halfHeight: Math.sqrt(this.config.sizeScale(_.get(d, accessor.sizeAccessor))) / 2,
        }
        points.push(obj)
      }
    })
    return points
  }

  // Event handlers

  _onMouseover (d, el, event) {
    if (d.accessor.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      actionman.fire('ToggleVisibility', d.accessor.tooltip, true, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d, el) {
    const tooltipId = d && d.accessor ? d.accessor.tooltip : this.config.get('y.tooltip')
    if (!_.isEmpty(tooltipId)) {
      actionman.fire('ToggleVisibility', tooltipId, false)
    }
    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }

  _onBackgroundClick () {
    const accessor = this.config.get('x.accessor')
    this.actionman.fire('Zoom', null, {[accessor]: this.model.getRangeFor(accessor, true)})
  }
}
