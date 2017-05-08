/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Brush from 'd3-brush'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import Config from './BrushConfigModel'
import './brush.scss'

export default class BrushView extends ContrailChartsView {
  static get Config () { return Config }

  constructor (...args) {
    super(...args)
    this._brush = d3Brush.brushX()
      .on('start brush end', this._onSelection.bind(this))
  }

  get tagName () { return 'g' }

  get zIndex () { return 9 }

  get selectors () {
    return _.extend(super.selectors, {
      handle: '.handle--custom',
      unselected: '.unselected',
    })
  }

  render () {
    super.render()
    this._brush
      .extent(this.config.extent)
      .handleSize(10)

    const yRange = this.config.get('yRange')
    this.d3.selectAll(this.selectors.unselected)
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('rect')
      .attr('class', d => `${this.selectorClass('unselected')}-${d.type}`)
      .classed('hide', true)
      .classed(this.selectorClass('unselected'), true)
      .attr('y', yRange[1])
      .attr('height', yRange[0] - yRange[1])

    this.d3.selectAll(this.selectors.handle)
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('path')
      .classed('hide', true)
      .classed(this.selectorClass('handle'), true)
      .attr('d', d3Shape.arc()
        .innerRadius(0)
        .outerRadius(this.config.handleHeight / 2)
        .startAngle(0)
        .endAngle((d, i) => { return i ? Math.PI : -Math.PI }))
    this.d3.call(this._brush)

    const brushGroup = this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration)
    this._brush.move(brushGroup, this.config.selection)
  }

  show (selection) {
    const xRange = this.config.get('xRange')
    this.d3.selectAll(this.selectors.unselected)
      .classed('hide', false)
      .attr('x', d => (d.type === 'w' ? xRange[0] : selection[1]))
      .attr('width', d => (d.type === 'w' ? selection[0] - xRange[0] : xRange[1] - selection[1]))

    this.d3.selectAll(this.selectors.handle)
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${this.config.handleCenter}) scale(1,2)`
      })
  }

  hide () {
    this.d3.selectAll(this.selectors.handle)
      .classed('hide', true)
    this.d3.selectAll(this.selectors.unselected)
      .classed('hide', true)
  }

  // Event handlers

  _onSelection () {
    let selection = d3Selection.event.selection
    const xRange = this.config.get('xRange')

    if (!selection) return this.hide()
    else this.show(selection)

    this.config.set('selection', selection, {silent: true})
    // selection is removed when clicking outside a brush
    if (selection[0] === selection[1]) {
      const xRange = this.config.get('xRange')
      selection = [xRange[0], xRange[1]]
    }
    if (_.isEqual(selection, xRange)) {
      setTimeout(() => this._brush.move(this.d3))
    }

    this.trigger('selection', selection)
  }
}
