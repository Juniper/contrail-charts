/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import './bar.scss'

export default class StackedBarView extends ContrailChartsView {
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }

  get zIndex () { return 1 }
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
      'mousemove node': '_onMousemove',
      'mouseout node': '_onMouseout',
    }
  }
  /**
   * @override
   */
  get xMarginInner () {
    if (this.model.data.length < 2) return 0
    return this.bandWidth / 2
  }
  // TODO use memoize function
  get bandWidth () {
    if (_.isEmpty(this.model.data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    // TODO do not use model.data.length as there can be gaps
    // or fill the gaps in it beforehand
    return this.config.getOuterWidth(this.model, this.width) / this.model.data.length * paddedPart
  }
  /**
  * @override
  * Y coordinate calculation considers position is being stacked
  */
  getScreenY (datum, yAccessor) {
    if (_.isNil(_.get(datum, yAccessor))) return undefined
    let stackedValue = 0
    _.takeWhile(this.config.yAccessors, accessorConfig => {
      stackedValue += (_.get(datum, accessorConfig.accessor) || 0)
      return accessorConfig.accessor !== yAccessor
    })
    return this.config.yScale(stackedValue)
  }

  render () {
    super.render()
    this.config.calculateScales(this.model, this.width, this.height)

    const start = this.config.yScale.range()[0]
    const barGroups = this.d3
      .selectAll(this.selectors.node)
      .data(this._prepareData(), d => d.id)
    barGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', start)
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(barGroups).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    barGroups.exit().remove()
  }

  _prepareData () {
    const data = this.model.data
    const start = this.config.yScale.domain()[0]
    const flatData = []
    const bandWidthHalf = (this.bandWidth / 2)
    _.each(data, d => {
      const x = _.get(d, this.config.get('x.accessor'))
      let stackedValue = start
      // y coordinate to stack next bar to
      _.each(this.config.yAccessors, accessorConfig => {
        const key = accessorConfig.accessor
        const value = _.get(d, key) || 0
        const obj = {
          id: x + '-' + key,
          x: this.config.xScale(x) - bandWidthHalf,
          y: this.config.yScale(value - start + stackedValue),
          h: this.config.yScale(start) - this.config.yScale(value + (stackedValue === start ? 0 : start)),
          w: this.bandWidth,
          color: this.config.getColor(d, accessorConfig),
          accessor: accessorConfig,
          data: d,
        }
        stackedValue += value
        flatData.push(obj)
      })
    })
    return flatData
  }

  // Event handlers

  _onMousemove (d, el, event) {
    if (d.accessor.tooltip) {
      const [left, top] = d3Selection.mouse(this._container)
      actionman.fire('ShowComponent', d.accessor.tooltip, {left, top}, d.data)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d, el) {
    const tooltipId = d && d.accessor ? d.accessor.tooltip : _.map(this.config.yAccessors, a => a.tooltip)
    if (!_.isEmpty(tooltipId)) {
      actionman.fire('HideComponent', tooltipId)
    }
    const els = el ? this.d3.select(() => el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
