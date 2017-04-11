import _ from 'lodash'
import * as d3Axis from 'd3-axis'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'
import './axis.scss'

export default class AxisView extends ContrailChartsView {
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
  /**
   * Renders axis and drawing groups.
   * Resizes chart dimensions if chart already exists.
   */
  render () {
    if (!this.config.scale) return
    super.render()

    const margin = this.config.get('margin')
    this.d3
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .classed(this.config.name, true)

    const tickSize = this.config.direction === 'horizontal' ? this.innerHeight : this.innerWidth
    this._d3Axis = d3Axis[_.camelCase(`axis-${this.config.position}`)](this.config.scale)
      .ticks(this.config.get('ticks'))
      .tickSize(tickSize * (this.config.location === 'start' ? -1 : 1))
      .tickPadding(10)

    if (this.config.formatter) this._d3Axis.tickFormat(this.config.formatter)
    if (this.config.tickCoords) {
      const values = _.map(this.config.tickCoords, coord => this.config.scale.invert(coord))
      this._d3Axis.tickValues(values)
    }

    this.d3.transition().ease(d3Ease.easeLinear).duration(this.config.duration)
    this.d3.call(this._d3Axis)

    this.d3
      .append('text')
      .attr('class', this.selectorClass('label'))
      .attr('x', this.innerWidth / 2)
      .text(this.config.getLabel(null, this.config.attributes))

    this.d3.select(this.selectors.label).attr('y', this.height)
  }
}
