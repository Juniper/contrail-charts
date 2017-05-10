/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Ease from 'd3-ease'
import ChartView from 'chart-view'
import Config from './AreaConfigModel'
import actionman from 'core/Actionman'
import './area.scss'

export default class AreaView extends ChartView {
  static get Config () { return Config }
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }

  get zIndex () { return 2 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.area',
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
  * Y coordinate calculation considers position is being stacked
  */
  getScreenY (datum, yAccessor) {
    const stackGroups = _.groupBy(this.config.yAccessors, 'stack')
    const stackName = _.find(this.config.yAccessors, config => config.accessor === yAccessor).stack
    let stackedValue = 0
    _.takeWhile(stackGroups[stackName], accessorConfig => {
      stackedValue += (_.get(datum, accessorConfig.accessor) || 0)
      return accessorConfig.accessor !== yAccessor
    })
    return this.config.yScale(stackedValue)
  }
  /**
   * Render all areas in a single stack unless specific stack names specified
   */
  render () {
    super.render()
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)

    const data = this.model.data
    const xAccessor = this.config.get('x.accessor')
    const area = d3Shape.area()
      .x(d => this.config.xScale(_.get(d.data, xAccessor)))
      .y0(d => this.config.yScale(d[1]))
      .y1(d => this.config.yScale(d[0]))
      .curve(this.config.get('curve'))

    const stackGroups = _.groupBy(this.config.yAccessors, 'stack')
    _.each(stackGroups, (accessorsByStack, stackName) => {
      const stack = d3Shape.stack()
        .offset(d3Shape.stackOffsetNone)
        .keys(_.map(accessorsByStack, 'accessor'))
        .value((d, key) => _.get(d, key))

      const areas = this.d3.selectAll(`${this.selectors.node}-${stackName}`).data(stack(data))
      areas.exit().remove()
      areas.enter().append('path')
        .attr('class', d => `${this.selectorClass('node')} ${this.selectorClass('node')}-${d.key} ${this.selectorClass('node')}-${stackName}`)
        .merge(areas)
        .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
        .attr('fill', d => this.config.getColor(d.key))
        .attr('d', area)
    })

    // Remove areas from non-updated stacks
    const updatedAreaClasses = _.reduce(_.keys(stackGroups), (sum, key) => {
      return sum ? `${sum}, ${this.selectors.node}-${key}` : `${this.selectors.node}-${key}`
    }, '')
    const updatedAreaEls = updatedAreaClasses ? this.el.querySelectorAll(updatedAreaClasses) : []
    const updatedAreas = _.difference(this.el.querySelectorAll(this.selectors.node), updatedAreaEls)
    _.each(updatedAreas, area => area.remove())

    this._ticking = false
  }

  // Event handlers

  _onMousemove (d, el) {
    const tooltipId = this.config.yAccessors[d.index].tooltip
    if (tooltipId) {
      const [left, top] = d3Selection.mouse(this._container)
      const xAccessor = this.config.get('x.accessor')
      const xVal = this.config.xScale.invert(left)
      const dataItem = this.model.getNearest(xAccessor, xVal)
      actionman.fire('ToggleVisibility', tooltipId, true, {left, top}, dataItem)
    }
    el.classList.add(this.selectorClass('active'))
  }

  _onMouseout (d, el) {
    const tooltipId = d && d.accessor ? d.accessor.tooltip : _.map(this.config.yAccessors, a => a.tooltip)
    if (!_.isEmpty(tooltipId)) {
      actionman.fire('ToggleVisibility', tooltipId, false)
    }
    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
