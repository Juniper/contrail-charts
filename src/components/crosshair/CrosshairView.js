/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Ease from 'd3-ease'
import ChartView from 'chart-view'
import Config from './CrosshairConfigModel'
import actionman from 'core/Actionman'
import ToggleVisibility from '../../actions/ToggleVisibility'
import './crosshair.scss'

export default class CrosshairView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return { ToggleVisibility } }
  static get isMaster () { return false }

  get tagName () { return 'g' }
  get zIndex () { return 9 }
  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.crosshair-node',
      line: '.line',
      text: '.text',
      bubble: '.bubble',
    })
  }
  /**
   * @param {Array [x, y]} point mouse offset relative to svg container
   */
  render () {
    super.render()
    const data = this.model.data
    // Draw crosshair line
    // TODO implement half lines
    if (this.config.get('lines') !== 'full') return
    const lineCoords = _.map(data.labels, label => {
      return {
        id: label.position,
        x1: data.dataPoint[0],
        x2: data.dataPoint[0],
        y1: this.innerHeight,
        y2: 0,
        label: label.value,
      }
    })
    const margin = this.config.get('margin')
    const lines = this.d3.selectAll(this.selectors.node).data(lineCoords)
    const linesEnter = lines.enter().append('g')
      .attr('class', this.selectorClass('node'))
    linesEnter
      .attr('transform', d => `translate(${d.x1}, ${d.y2})`)
      .merge(lines)
      .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('transform', d => `translate(${d.x1}, ${d.y2})`)
    linesEnter.append('line')
      .attr('class', this.selectorClass('line'))
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
    linesEnter.append('text')
      .attr('class', this.selectorClass('text'))
      .attr('y', d => d.y1 + margin.label)
      .text(d => d.label)
    const update = linesEnter.merge(lines)
    update.selectAll(this.selectors.line)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
    update.selectAll(this.selectors.text)
      .attr('y', d => d.y1 + margin.label)
      .text(d => d.label)

    // Draw bubbles for all enabled y accessors.
    update.each((d, i, els) => {
      const bubbles = d3Selection.select(els[i]).selectAll(this.selectors.bubble)
        .data(data.points, d => d.id)
      bubbles.enter().append('circle')
        .classed(this.selectorClass('bubble'), true)
        .attr('cx', 0)
        .attr('cy', d => d.y)
        .attr('fill', d => d.color)
        .attr('r', 0)
        .merge(bubbles)
        .transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
        .attr('cy', d => d.y)
        .attr('r', this.config.get('bubbleR'))
      bubbles.exit().remove()
    })

    // Show tooltip
    const tooltipConfig = {
      left: this.svgOffset.left + margin.left + data.dataPoint[0],
      top: this.svgOffset.top + margin.top + data.dataPoint[1],
      placement: 'horizontal',
    }
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), true, data.item, tooltipConfig)
  }

  hide () {
    super.hide()
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), false)
  }
}
