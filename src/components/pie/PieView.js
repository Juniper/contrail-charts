// Copyright (c) Juniper Networks, Inc. All rights reserved.

import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import './pie.scss'

export default class PieView extends ContrailChartsView {
  static get dataType () { return 'Serie' }

  constructor (p = {}) {
    super(p)
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }
  /**
   * follow same naming convention for all charts
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.arc',
      highlight: '.highlight',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click node': '_onClickNode',
      'mouseover node': '_onMouseover',
      'mousemove node': '_onMousemove',
      'mouseout node': '_onMouseout',
    })
  }

  render () {
    super.render()
    this._onMouseout()
    const serieConfig = this.config.get('serie')
    const radius = this.config.get('radius')
    const data = this.model.data

    const arc = d3Shape.arc()
      .outerRadius(radius)
      .innerRadius(this.config.innerRadius)

    const stakes = d3Shape.pie()
      .sort(null)
      .value(d => serieConfig.getValue(d))(data)

    this.d3.attr('transform', `translate(${this.width / 2}, ${this.height / 2})`)

    const sectors = this.d3.selectAll(this.selectors.node)
      .data(stakes, d => d.value)

    sectors
      .enter().append('path')
      .classed(this.selectorClass('node'), true)
      .style('fill', d => this.config.getColor(d.data))
      .merge(sectors)
      .classed(this.selectorClass('interactive'), this.config.hasAction('node'))
      .attr('d', arc)
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .style('fill', d => this.config.getColor(d.data))

    sectors.exit().remove()

    this._ticking = false
  }

  // Event handlers

  _onMouseover (d, el, event) {
    const radius = this.config.get('radius')
    const highlightArc = d3Shape.arc(d)
      .innerRadius(radius)
      .outerRadius(radius * 1.06)
      .startAngle(d.startAngle)
      .endAngle(d.endAngle)
    this.d3
      .append('path')
      .classed('arc', true)
      .classed(this.selectorClass('highlight'), true)
      .attr('d', highlightArc)
      .style('fill', this.config.getColor(d.data))
  }

  _onMousemove (d, el, event) {
    const [left, top] = d3Selection.mouse(this._container)
    actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d.data)
  }

  _onMouseout (d, el) {
    this.d3.selectAll(this.selectors.highlight).remove()
    actionman.fire('HideComponent', this.config.get('tooltip'))
  }

  _onClickNode (d, el, e) {
    this._onMouseout(d, el)
    super._onEvent(d, el, e)
  }
}
