/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Ease from 'd3-ease'
import * as d3Array from 'd3-array'
import XYChartSubView from 'components/composite-y/XYChartSubView'
import actionman from 'core/Actionman'
import './area-chart.scss'

export default class AreaChartView extends XYChartSubView {
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

  combineDomains () {
    const domains = super.combineDomains()

    const stackGroups = _.groupBy(this.params.activeAccessorData, 'stack')
    const totalRangeValues = _.reduce(stackGroups, (totalRangeValues, accessors) => {
      const stackedRange = _.reduce(accessors, (stackedRange, accessor) => {
        const range = this.model.getRangeFor(accessor.accessor)
        // Summarize ranges for stacked layers
        return [stackedRange[0] + range[0], stackedRange[1] + range[1]]
      }, [0, 0])
      // Get min / max extent for non-stacked layers
      return totalRangeValues.concat(stackedRange)
    }, [0, 0])
    const totalRange = d3Array.extent(totalRangeValues)
    if (domains[this.axisName]) domains[this.axisName] = totalRange
    return domains
  }
  /**
  * @override
  * Y coordinate calculation considers position is being stacked
  */
  getScreenY (datum, yAccessor) {
    const stackGroups = _.groupBy(this.params.activeAccessorData, 'stack')
    const stackName = _.find(this.params.activeAccessorData, config => config.accessor === yAccessor).stack
    let stackedValue = 0
    _.takeWhile(stackGroups[stackName], accessorConfig => {
      stackedValue += (_.get(datum, accessorConfig.accessor) || 0)
      return accessorConfig.accessor !== yAccessor
    })
    return this.yScale(stackedValue)
  }
  /**
   * Render all areas in a single stack unless specific stack names specified
   */
  render () {
    super.render()
    const data = this.model.data
    const xAccessor = this.config.get('plot.x.accessor')
    const area = d3Shape.area()
      .x(d => this.xScale(_.get(d.data, xAccessor)))
      .y0(d => this.yScale(d[1]))
      .y1(d => this.yScale(d[0]))
      .curve(this.config.get('curve'))

    const stackGroups = _.groupBy(this.params.activeAccessorData, 'stack')
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
        .transition().ease(d3Ease.easeLinear).duration(this.params.duration)
        .attr('fill', d => this.config.getColor([], _.find(accessorsByStack, {accessor: d.key})))
        .attr('d', area)
    })

    // Remove areas from non-updated stacks
    const updatedAreaClasses = _.reduce(_.keys(stackGroups), (sum, key) => {
      return sum ? `${sum}, ${this.selectors.node}-${key}` : `${this.selectors.node}-${key}`
    }, '')
    const updatedAreaEls = updatedAreaClasses ? this.el.querySelectorAll(updatedAreaClasses) : []
    const updatedAreas = _.difference(this.el.querySelectorAll(this.selectors.node), updatedAreaEls)
    _.each(updatedAreas, area => area.remove())
  }

  // Event handlers

  _onMousemove (d, el) {
    const tooltipId = this.params.activeAccessorData[d.index].tooltip
    if (tooltipId) {
      const [left, top] = d3Selection.mouse(this._container)
      const xAccessor = this.config.get('plot.x.accessor')
      const xVal = this.xScale.invert(left)
      const dataItem = this.model.getNearest(xAccessor, xVal)
      actionman.fire('ShowComponent', tooltipId, {left, top}, dataItem)
    }
    el.classList.add(this.selectorClass('active'))
  }
}
