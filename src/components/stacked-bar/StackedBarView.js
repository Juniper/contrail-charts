/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ChartView from 'chart-view'
import Config from './StackedBarConfigModel'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import SelectColor from '../../actions/SelectColor'
import SelectKey from '../../actions/SelectKey'
import './bar.scss'

export default class StackedBarView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {SelectColor, SelectKey} }

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
  // TODO use memoize function
  get bandWidth () {
    if (_.isEmpty(this.model.data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 100)
    // TODO do not use model.data.length as there can be gaps
    // or fill the gaps in it beforehand
    return this.config.getOuterWidth(this.model, this.innerWidth) / this.model.data.length * paddedPart
  }

  get padding () {
    const horizontal = this.model.data.length < 2 ? 0 : this.bandWidth / 2
    return _.defaultsDeep({left: horizontal, right: horizontal}, this.config.padding)
  }

  getScreenX (datum) {
    return this.config.xScale(_.get(datum, this.config.get('x.accessor')))
  }
  /**
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

  calculateScales () {
    this.config.set('x.range', [this.padding.left, this.innerWidth - this.padding.right], {silent: true})
    this.config.set('y.range', [this.innerHeight - this.padding.bottom, this.padding.top], {silent: true})
    this.config.calculateScales(this.model)
  }

  render () {
    super.render()
    this._onMouseout()
    // frozen component is completely controlled from outside
    if (!this.config.get('frozen')) this.calculateScales()

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

    this._ticking = false
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
          color: this.config.getColor(accessorConfig.accessor, d),
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
      const tooltipConfig = {left, top, container: this._container}
      actionman.fire('ToggleVisibility', d.accessor.tooltip, true, d.data, tooltipConfig)
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
