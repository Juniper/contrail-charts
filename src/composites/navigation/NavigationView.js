/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ChartView from 'chart-view'
import Config from './NavigationConfigModel'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import Zoom from '../../actions/Zoom'
import Browse from '../../actions/Browse'
import ToggleHalt from '../../actions/ToggleHalt'
import CompositeYView from 'composites/y/CompositeYView'
import BrushView from 'components/brush/BrushView'

export default class NavigationView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {Zoom, Browse, ToggleHalt} }

  constructor (...args) {
    super(...args)
    // needs more time to not encounter onSelection event after zoom
    this._debouncedEnable = _.debounce(() => { this._disabled = false }, this.config.get('duration') * 2)
  }

  render () {
    super.render()
    if (!this._yChart) {
      this._yChart = new CompositeYView({
        config: {
          frozen: true,
          height: this.config.get('height'),
          margin: this.config.get('margin'),
          duration: this.config.get('duration'),
          axes: this.config.get('axes'),
          plot: this.config.get('plot'),
        },
        container: this.el,
        model: this.model,
      })
      this._yChart.render()
    }
    if (!this._brush) {
      this._brush = new BrushView({
        container: this.el,
        config: {
          isSharedContainer: true,
          margin: this._yChart.config.margin,
          height: this.height,
        },
      })
      this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    }
    this._update()
  }

  remove () {
    super.remove()
    this._components = []
    this.stopListening(this._brush, 'selection')
  }
  /**
   * is limited to x scale
   */
  zoom (ranges) {
    let selection
    if (ranges) {
      const range = ranges[this.config.get('plot.x.accessor')]
      if (!range || range[0] === range[1]) return
      const sScale = this.config.get('selectionScale')
      const visualMin = this._yChart.config.xScale(range[0])
      const visualMax = this._yChart.config.xScale(range[1])

      // round zoom range to integers in percents including the original exact float values
      selection = [_.floor(sScale.invert(visualMin)), _.ceil(sScale.invert(visualMax))]
    }

    if (_.isEqual(this.config.get('selection'), selection)) return
    this.config.set('selection', selection, {silent: true})
    this._disabled = true
    this._update()
    this._debouncedEnable()
  }

  browse (attribute) {
    const selection = this._brush.config.get('selection').slice()
    const xScale = this._yChart.config.get('axes.x.scale')
    selection[0] = xScale.invert(selection[0])
    selection[1] = xScale.invert(selection[1])
    let browseMoveBy = this.config.get('browseMoveBy')
    if (attribute === 'back') {
      browseMoveBy = -browseMoveBy
    }
    selection[0] += browseMoveBy
    selection[1] += browseMoveBy
    selection[0] = xScale(selection[0])
    selection[1] = xScale(selection[1])
    if (selection[0] < xScale.range()[0]) {
      const delta = selection[1] - selection[0]
      selection[1] = xScale.range()[1]
      selection[0] = selection[1] - delta
    }
    if (selection[1] > xScale.range()[1]) {
      const delta = selection[1] - selection[0]
      selection[0] = xScale.range()[0]
      selection[1] = selection[0] + delta
    }
    this._brush.move(selection)
  }

  setHalt (toggle) {
    if (!toggle) {
      // Start to play.
      const selection = this._brush.config.get('selection').slice()
      this._brush.move(selection)
      this._timer = window.setTimeout(this._animateBrush.bind(this), 1000)
    } else {
      // Halt.
      window.clearTimeout(this._timer)
    }
  }

  _animateBrush () {
    // Keep moving the selection forward once every second.
    this.browse('forward')
    this._timer = window.setTimeout(this._animateBrush.bind(this), 1000)
  }

  // Event handlers

  _onSelection (range) {
    if (this._disabled) return
    const xAccessor = this.config.get('plot.x.accessor')
    const xScale = this._yChart.config.get('axes.x.scale')
    let xMin = xScale.invert(range[0])
    let xMax = xScale.invert(range[1])
    const sScale = this.config.get('selectionScale')
    const selection = [_.floor(sScale.invert(range[0])), _.ceil(sScale.invert(range[1]))]
    this.config.set('selection', selection, {silent: true})

    const data = {[xAccessor]: [xMin, xMax]}
    actionman.fire('Zoom', this.config.get('update'), data)
  }
  /**
   * Turn off selection for the animation period on resize
   */
  _onResize () {
    this._disabled = true
    this._debouncedEnable()
    if (!this._ticking) {
      window.requestAnimationFrame(this._update.bind(this))
      this._ticking = true
    }
  }
  /**
   * Composite Y component is updated on resize on its own
   */
  _update () {
    this._yChart.render()
    const xRange = this._yChart.config.get('axes.x.scale').range()
    const yRange = this._yChart.config.get('axes.y.scale').range()
    this._brush.config.set({
      selection: this.config.getSelectionRange(xRange),
      xRange,
      yRange,
    }, {silent: true})
    this._brush.render()
    this._ticking = false
  }
}
