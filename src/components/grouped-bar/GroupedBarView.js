/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Array from 'd3-array'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import './bar.scss'

export default class GroupedBarView extends ContrailChartsView {
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

  get bandWidth () {
    const data = this.model.data
    if (_.isEmpty(data)) return 0
    const paddedPart = 1 - (this.config.get('barPadding') / 2 / 100)
    // TODO do not use model.data.length as there can be gaps
    // or fill the gaps in it beforehand
    return this.config.getOuterWidth(this.model, this.width) / data.length * paddedPart
  }

  getScreenX (datum, xAccessor, yAccessor) {
    let delta = 0
    _.each(this.config.yAccessors, (accessor, j) => {
      if (accessor.accessor === yAccessor) {
        delta = this._innerBandScale(j) + this._innerBandScale.bandwidth() / 2
      }
    })
    return this.config.xScale(_.get(datum, xAccessor)) + delta
  }

  getScreenY (datum, yAccessor) {
    return this.config.yScale(_.get(datum, yAccessor))
  }

  render () {
    super.render()
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)

    // Create a flat data structure
    const numOfAccessors = _.keys(this.config.yAccessors).length
    const bandWidthHalf = this.bandWidth / 2
    this._innerBandScale = d3Scale.scaleBand()
      .domain(d3Array.range(numOfAccessors))
      .range([-bandWidthHalf, bandWidthHalf])
      .paddingInner(0.05)
      .paddingOuter(0.05)
    // Render the flat data structure
    const svgBarGroups = this.d3
      .selectAll(this.selectors.node)
      .data(this._prepareData(), d => d.id)
    svgBarGroups.enter().append('rect')
      .attr('class', d => 'bar')
      .attr('x', d => d.x)
      .attr('y', this.config.yScale.range()[0])
      .attr('height', 0)
      .attr('width', d => d.w)
      .merge(svgBarGroups).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('fill', d => d.color)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('height', d => d.h)
      .attr('width', d => d.w)
    svgBarGroups.exit().remove()

    this._ticking = false
  }

  _prepareData () {
    const flatData = []
    const start = this.config.yScale.domain()[0]
    const innerBandWidth = this._innerBandScale.bandwidth()
    _.each(this.model.data, d => {
      const x = _.get(d, this.config.get('x.accessor'))
      _.each(this.config.yAccessors, (accessor, j) => {
        const key = accessor.accessor
        const obj = {
          id: x + '-' + key,
          x: this.config.xScale(x) + this._innerBandScale(j),
          // TODO in order to plot in forth quadrant use: y: this.config.yScale.range()[1]
          y: this.config.yScale(_.get(d, key)),
          h: this.config.yScale(start) - this.config.yScale(_.get(d, key)),
          w: innerBandWidth,
          color: this.config.getColor(d, accessor),
          accessor: accessor,
          data: d,
        }
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
    // TODO Here and in all similar components with _onMouseout global d3Selection is used instead of this.d3.select
    // because it replaces associated "el" bar data with this.d3.__data__
    const els = el ? d3Selection.select(el) : this.d3.selectAll(this.selectors.node)
    els.classed('active', false)
  }
}
