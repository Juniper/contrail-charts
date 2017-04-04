/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import 'd3-transition'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import XYChartSubView from 'components/composite-y/XYChartSubView'
import BucketConfigModel from 'helpers/bucket/BucketConfigModel'
import BucketView from 'helpers/bucket/BucketView'
import actionman from 'core/Actionman'
import './scatter-plot.scss'

export default class ScatterPlotView extends XYChartSubView {
  constructor (p) {
    super(p)
    const bucketConfig = this.config.get('bucket')
    if (bucketConfig) {
      this._bucketConfigModel = new BucketConfigModel(bucketConfig)
      this._bucketConfigModel.set('clip', this._parent.clip)
      this._bucketConfigModel.parent = this.config
      this._bucketView = new BucketView({
        config: this._bucketConfigModel,
        actionman: this._actionman,
      })
    }
  }

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
  /**
   * @return {Object} like:  y1: [0,10], x: [-10,10]
   */
  combineDomains () {
    const domains = super.combineDomains()
    const accessorsBySizeAxis = _.groupBy(this.params.activeAccessorData, 'sizeAxis')
    _.each(accessorsBySizeAxis, (accessors, axis) => {
      const validAccessors = _.filter(accessors, a => a.sizeAccessor && a.shape)
      const validAccessorNames = _.map(validAccessors, 'sizeAccessor')

      domains[axis] = this.model.combineDomains(validAccessorNames)
    })
    return domains
  }

  render () {
    super.render()
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
  }
  /**
   * Create a flat data structure
   */
  _prepareData () {
    const xAccessor = this.config.get('plot.x.accessor')
    const points = []
    _.map(this.model.data, d => {
      const x = _.get(d, xAccessor)
      _.each(this.params.activeAccessorData, accessor => {
        const key = accessor.accessor
        if (!_.isNil(_.get(d, key))) { // key may not exist in all the data set.
          const sizeScale = this.params.axis[accessor.sizeAxis].scale
          const obj = {
            id: x + '-' + key,
            x: this.xScale(x),
            y: this.yScale(_.get(d, key)),
            area: sizeScale(_.get(d, accessor.sizeAccessor)),
            color: this.config.getColor(d, accessor),
            accessor: accessor,
            data: d,
            halfWidth: Math.sqrt(sizeScale(_.get(d, accessor.sizeAccessor))) / 2,
            halfHeight: Math.sqrt(sizeScale(_.get(d, accessor.sizeAccessor))) / 2,
          }
          points.push(obj)
        }
      })
    })
    return points
  }

  // Event handlers

  _onMouseover (d, el, event) {
    if (d.accessor.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onBackgroundClick () {
    const accessor = this.config.get('plot.x.accessor')
    this.actionman.fire('Zoom', null, {[accessor]: this.model.getRangeFor(accessor, true)})
  }
}
