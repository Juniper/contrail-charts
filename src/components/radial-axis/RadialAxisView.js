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
      node: '.radial-axis',
      label: '.axis-label',
      tick: '.tick',
    })
  }

  get height () {
    return this.config.get('height') || this.width
  }

  get radius () {
    return Math.min(this.innerWidth, this.innerHeight) / 2
  }

  /**
   * Axis is rendered outside the container inner (width * height) area on margins
   */
  render () {
    const scale = this.config.scale
    if (!scale) return
    super.render()

    this.d3
      .attr('transform', `translate(${this.radius}, ${this.radius})`)
      .classed(this.config.name, true)

    if (this.config.position === 'radial') {
      const radialTickValues = scale.ticks(this.config.get('ticks'))
      const radialAxisTicks = this.d3.selectAll('.tick').data(radialTickValues)
      const radialAxisTicksEnter = radialAxisTicks.enter().append('g')
        .attr('class', 'tick')
      radialAxisTicksEnter.append('circle')
        .attr('r', d => scale(d))
      radialAxisTicksEnter.append('text')
        .text(d => d)
        .attr('dy', d => -scale(d))
      const radialAxisTicksEdit = radialAxisTicks.transition()
        .ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      radialAxisTicksEdit.select('circle')
        .attr('r', d => scale(d))
      radialAxisTicksEdit.select('text')
        .text(d => d)
        .attr('dy', d => -scale(d))
      radialAxisTicks.exit().remove()
    }
    if (this.config.position === 'angular') {
      const angularTickValues = scale.ticks(this.config.get('ticks'))
      const angularTickLines = []
      _.each(angularTickValues, a => {
        _.each(this.config.get('otherAxisScales'), otherScale => {
          const line = {
            value: a,
            points: [{ angle: scale(a), r: otherScale.range()[0] }, { angle: scale(a), r: otherScale.range()[1] }]
          }
          angularTickLines.push(line)
        })
      })
      // Remove last angular tick as it is the same as first.
      if (this.config.get('removeLastAngularTick') && angularTickLines.length) {
        for (let i = 0; i < this.config.get('otherAxisScales').length; i++) {
          angularTickLines.pop()
        }
      }
      const radialAxisLine = d3Shape.radialLine()
        .angle(p => p.angle)
        .radius(p => p.r)
        .curve(d3Shape.curveLinear)
      const radialAxisPath = this.d3.selectAll('.tick')
        .data(angularTickLines)
      const radialAxisPathEnter = radialAxisPath.enter().append('g')
        .attr('class', 'tick')
      radialAxisPathEnter.append('path')
        .attr('d', d => radialAxisLine(d.points))
      radialAxisPathEnter.append('text')
        .attr('x', d => Math.cos(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .attr('y', d => Math.sin(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .text(d => d.value)
      const radialAxisPathEdit = radialAxisPath.transition()
        .ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      radialAxisPathEdit.select('path')
        .attr('d', d => radialAxisLine(d.points))
      radialAxisPathEdit.select('text')
        .attr('x', d => Math.cos(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .attr('y', d => Math.sin(d.points[0].angle - Math.PI / 2) * (d.points[1].r + 10))
        .text(d => d.value)
      radialAxisPath.exit().remove()
    }
    // TODO this._renderLabel()
    this._ticking = false
  }
}
