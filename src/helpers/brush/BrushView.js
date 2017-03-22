/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './brush.scss'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Brush from 'd3-brush'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'

export default class BrushView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._brush = d3Brush.brushX()
    this.listenTo(this.config, 'change', this.render)
  }

  get tagName () { return 'g' }
  get zIndex () { return 9 }

  render () {
    super.render()
    this._brush
      .extent(this.config.extent)
      .handleSize(10)
      .on('start brush end', this._onSelection.bind(this))
    this.d3.selectAll('.handle--custom')
      .data([{type: 'w'}, {type: 'e'}])
      .enter().append('path')
      .classed('hide', true)
      .classed('handle--custom', true)
      .attr('d', d3Shape.arc()
        .innerRadius(0)
        .outerRadius(this.config.handleHeight / 2)
        .startAngle(0)
        .endAngle((d, i) => { return i ? Math.PI : -Math.PI }))
    this.d3.call(this._brush)
    const brushGroup = this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration)
    this._brush.move(brushGroup, this.config.selection)
  }

  remove () {
    this.d3.selectAll('.handle--custom')
      .classed('hide', true)
  }

  // Event handlers

  _onSelection () {
    let selection = d3Selection.event.selection
    if (!selection) {
      return this.remove()
    }
    this.config.set('selection', selection, {silent: true})
    this.d3.selectAll('.handle--custom')
      .classed('hide', false)
      .attr('transform', (d, i) => {
        return `translate(${selection[i]},${this.config.handleCenter}) scale(1,2)`
      })
    // selection is removed when clicking outside a brush
    if (selection[0] === selection[1]) {
      const xRange = this.config.get('xRange')
      selection = [xRange[0], xRange[1]]
    }
    this.trigger('selection', selection)
  }
}
