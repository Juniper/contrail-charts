/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Ease from 'd3-ease'
import * as d3Scale from 'd3-scale'
import ChartView from 'chart-view'
import Config from './TimelineConfigModel'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import Zoom from '../../actions/Zoom'
import BrushView from 'components/brush/BrushView'
import './timeline.scss'

export default class TimelineView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {Zoom} }

  constructor (...args) {
    super(...args)
    this._brush = new BrushView({
      container: this._container,
      config: { isSharedContainer: true, },
    })

    this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    this._debouncedEnable = _.debounce(() => { this._disabled = false }, this.config.get('duration'))
  }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      bar: '.timeline-bar',
    })
  }

  get width () {
    return this.config.get('width') || this._container.getBoundingClientRect().width
  }

  render () {
    const rect = this._container.getBoundingClientRect()
    super.render()

    const xAccessor = this.config.get('accessor')
    const xRange = [0, this.config.get('width') || rect.width]
    const yRange = [this.config.get('height'), 0]
    const xScale = d3Scale.scaleLinear().range(xRange).domain(this.model.getRangeFor(xAccessor))
    this.config.set({xRange, yRange, xScale}, {silent: true})

    const barHeight = 10
    this._bar = this.d3.selectAll(this.selectors.bar)
      .data([{barHeight}])
    this._bar.enter().append('rect')
      .attr('class', this.selectorClass('bar'))
      .attr('x', xRange[0])
      .attr('y', yRange[0] / 2 - barHeight / 2)
      .attr('height', barHeight)
      .attr('width', xRange[1] - xRange[0])
      .merge(this._bar).transition().ease(d3Ease.easeLinear).duration(this.config.get('duration'))
      .attr('y', yRange[0] / 2 - barHeight / 2)
      .attr('width', xRange[1] - xRange[0])
    this._bar.exit().remove()

    this._brush.config.set({
      selection: this.config.selectionRange,
      xRange,
      yRange,
    }, {silent: true})
    this._brush.render()

    this._ticking = false
  }

  zoom (ranges) {
    const sScale = this.config.get('selectionScale')
    const xScale = this.config.get('xScale')
    const visualMin = xScale(ranges.x[0])
    const visualMax = xScale(ranges.x[1])

    // round zoom range to integers in percents including the original exact float values
    const selection = [_.floor(sScale.invert(visualMin)), _.ceil(sScale.invert(visualMax))]

    if (_.isEqual(this.config.get('selection'), selection)) return
    this.config.set('selection', selection, {silent: true})
    this._update()
  }

  // Event handlers

  _onSelection (range) {
    if (this._disabled) return
    const xAccessor = this.config.get('accessor')
    const xScale = this.config.get('xScale')
    let xMin = xScale.invert(range[0])
    let xMax = xScale.invert(range[1])
    const sScale = this.config.get('selectionScale')
    const selection = [_.floor(sScale.invert(range[0])), _.ceil(sScale.invert(range[1]))]
    this.config.set('selection', selection, {silent: true})

    // TODO navigation should not know anything about the data it operates
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()

    const data = {[xAccessor]: [xMin, xMax]}
    actionman.fire('Zoom', data)
  }
  /**
   * Turn off selection for the animation period on resize
   */
  _onResize () {
    this._disabled = true
    this._debouncedEnable()
    if (!this._ticking) {
      window.requestAnimationFrame(this.render.bind(this))
      this._ticking = true
    }
  }
}
