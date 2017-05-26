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
    if (!this.config.scale) return
    super.render()

    const radius = this.radius
    const margin = this.config.get('margin')
    this.d3
      //.attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('transform', `translate(${radius}, ${radius})`)
      .classed(this.config.name, true)

    console.log('RadialAxis (' + this.config.get('name') + ') config: ', this.config, this.config.scale.domain(), this.config.scale.range(), this.radius)

    if (this.config.get('position') === 'r') {
      const points = [{ angle: 0, r: this.config.scale.range()[0] }, { angle: 0, r: this.config.scale.range()[1] }]
      this._rAxisLine = d3Shape.radialLine()
        .angle(p => p.angle)
        .radius(p => p.r)
        .curve(d3Shape.curveLinear)
      const rAxisPath = this.d3.selectAll('.axis')
        .data([this.config.toJSON()])
      rAxisPath.enter().append('path')
        .attr('class', 'axis')
        .attr('d', this._rAxisLine(points))
        //.transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
        //.attrTween('d', this._interpolate.bind(this, data, key))
        //.attr('stroke', this.config.getColor())
      rAxisPath.transition()
        .ease(d3Ease.easeLinear).duration(this.config.get('duration'))
        .attr('d', this._rAxisLine(points))
        //.attrTween('d', (d, i, els) => {
        //  const previous = els[i].getAttribute('d')
        //  const current = this._line(data)
        //  return d3InterpolatePath(previous, current)
        //})
        //.attr('stroke', this.config.getColor())
      rAxisPath.exit().remove()
    }


    /*
    this._d3Axis = d3Axis[_.camelCase(`axis-${this.config.position}`)](this.config.scale)
      .ticks(this.config.get('ticks'))
      .tickSize(this._tickLength * this.config.side)
      .tickPadding(10)

    if (this.config.formatter) this._d3Axis.tickFormat(this.config.formatter)
    if (this.config.tickCoords) this._d3Axis.tickValues(this.config.tickValues)

    this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration)
    this.d3.call(this._d3Axis)
    this._renderLabel()
    */

    this._ticking = false
  }

  /**
   * Labels are rendered at the center along axis
   * TODO not optimal label spacing
   * and in the first quater of the margin between container edge and tick
   */
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
}
