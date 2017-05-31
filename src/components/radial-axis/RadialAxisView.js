import _ from 'lodash'
import * as d3Ease from 'd3-ease'
import * as d3Shape from 'd3-shape'
import ChartView from 'chart-view'
import Config from './RadialAxisConfigModel'
import './radial-axis.scss'

export default class RadialAxisView extends ChartView {
  static get Config () { return Config }

  constructor (...args) {
    super(...args)
    this.render()
  }

  get tagName () { return 'g' }

  get zIndex () { return 0 }

  /**
   * follow same naming convention for all XY chart sub views
   */
  get selectors () {
    return _.extend(super.selectors, {
      node: '.axis',
      label: '.axis-label',
      tick: '.tick',
    })
  }

  get height () {
    return this.config.get('height') || this.width
  }

  get radius () {
    return Math.min(this.width, this.height) / 2
  }

  /**
   * Axis is rendered outside the container inner (width * height) area on margins
   */
  render () {
    const scale = this.config.scale
    if (!scale) return
    super.render()

    const radius = this.radius
    const margin = this.config.get('margin')
    this.d3
      .attr('transform', `translate(${radius}, ${radius})`)
      .classed(this.config.name, true)

    if (this.config.position === 'r') {
      const rTickValues = scale.ticks(this.config.get('ticks'))
      const rAxisTicks = this.d3.selectAll('.tick').data(rTickValues)
      const rAxisTicksEnter = rAxisTicks.enter().append('g')
        .attr('class', 'tick')
      rAxisTicksEnter.append('circle')
        .attr('r', d => scale(d))
      rAxisTicksEnter.append('text')
        .text(d => d)
        .attr('dy', d => -scale(d))
      const rAxisTicksEdit = rAxisTicks.transition()
        .ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      rAxisTicksEdit.select('circle')
        .attr('r', d => scale(d))
      rAxisTicks.exit().remove()
    }
    if (this.config.position === 'angle') {
      const angleTickValues = scale.ticks(this.config.get('ticks'))
      const angleTickLines = []
      _.each(angleTickValues, a => {
        _.each(this.config.get('otherAxisScales'), otherScale => {
          const line = {
            value: a,
            points: [{ angle: scale(a), r: otherScale.range()[0] }, { angle: scale(a), r: otherScale.range()[1] }]
          }
          angleTickLines.push(line)
        })
      })
      // Remove last angle tick as it is the same as first.
      if (this.config.get('removeLastAngleTick') && angleTickLines.length) {
        for (let i = 0; i < this.config.get('otherAxisScales').length; i++) {
          angleTickLines.pop()
        }
      }
      const points = []
      const rAxisLine = d3Shape.radialLine()
        .angle(p => p.angle)
        .radius(p => p.r)
        .curve(d3Shape.curveLinear)
      const rAxisPath = this.d3.selectAll('.tick')
        .data(angleTickLines)
      const rAxisPathEnter = rAxisPath.enter().append('g')
        .attr('class', 'tick')
      rAxisPathEnter.append('path')
        .attr('d', d => rAxisLine(d.points))
      rAxisPathEnter.append('text')
        .attr('x', d => Math.cos(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .attr('y', d => Math.sin(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .text(d => d.value)
      const rAxisPathEdit = rAxisPath.transition()
        .ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      rAxisPathEdit.select('path')
        .attr('d', d => rAxisLine(d.points))
      rAxisPathEdit.select('text')
        .attr('x', d => Math.cos(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .attr('y', d => Math.sin(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .text(d => d.value)
      rAxisPath.exit().remove()
    }
    //this._renderLabel()
    this._ticking = false
  }

  /**
   * Labels are rendered at the center along axis
   * TODO not optimal label spacing
   * and in the first quater of the margin between container edge and tick
   */
  /*
  _renderLabel () {
    const offset = {
      along: this._plotLength / 2,
      across: this._tickLength * +(this.config.location === 'end') +
        this.config.get('margin.' + this.config.position) * 0.75 * this.config.side,
    }

    const labels = this.d3.selectAll(this.selectors.label)
      .data(this.config.labels)
    labels
      .enter()
      .append('text')
      .attr('class', this.selectorClass('label'))
      .text(d => d)
      .merge(labels)
      .attr('transform', (d, i) => {
        offset.across += i * this.config.get('margin.label') * this.config.side
        const position = this.config.isHorizontal ? [offset.along, offset.across] : [offset.across, offset.along]

        return `translate(${position[0]}, ${position[1]})
          rotate(${90 * this.config.side * +!this.config.isHorizontal})`
      })

    labels.exit().remove()
  }
  */
}
