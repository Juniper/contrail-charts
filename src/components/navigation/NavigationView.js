/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import Config from './ControlPanelConfigModel'
import actionman from 'core/Actionman'
import CompositeYView from 'components/composite-y/CompositeYView'
import CompositeYConfigModel from 'components/composite-y/CompositeYConfigModel'
import BrushView from 'helpers/brush/BrushView'
import BrushConfigModel from 'helpers/brush/BrushConfigModel'

export default class NavigationView extends ContrailChartsView {
  static get Config () { return Config }
  static get dataType () { return 'DataFrame' }

  constructor (p) {
    super(p)
    this._brush = new BrushView({
      config: new BrushConfigModel({
        isSharedContainer: true,
      }),
    })
    const compositeYConfig = new CompositeYConfigModel(this.config.attributes)
    this._compositeYChartView = new CompositeYView({
      config: compositeYConfig,
      model: this.model,
    })
    this._components = [this._brush, this._compositeYChartView]
    this.listenTo(this._brush, 'selection', _.throttle(this._onSelection))
    this.listenTo(this.model, 'change', this._onModelChange)
    // needs more time to not encounter onSelection event after zoom
    this._debouncedEnable = _.debounce(() => { this._disabled = false }, this.config.get('duration') * 2)
  }

  render () {
    super.render()
    this.resetParams()
    this._compositeYChartView.container = this.el
    // TODO this will also trigger render async, but the next one is needed by following _update immediately
    this._compositeYChartView.config.set(this.config.attributes)
    this._compositeYChartView.render()
    this._update()
  }

  remove () {
    super.remove()
    _.each(this._components, (component) => {
      component.remove()
    })
    this._components = []
    this.stopListening(this._brush, 'selection')
  }

  zoom (ranges) {
    const range = ranges[this.config.get('plot.x.accessor')]
    if (!range || range[0] === range[1]) return
    const sScale = this.config.get('selectionScale')
    const visualMin = this.params.xScale(range[0])
    const visualMax = this.params.xScale(range[1])

    // round zoom range to integers in percents including the original exact float values
    const selection = [_.floor(sScale.invert(visualMin)), _.ceil(sScale.invert(visualMax))]

    if (_.isEqual(this.config.get('selection'), selection)) return
    this.config.set('selection', selection, {silent: true})
    this._disabled = true
    this._update()
    this._debouncedEnable()
  }

  // Event handlers

  _onModelChange () {
    this.render()
  }

  _onSelection (range) {
    if (this._disabled) return
    const xAccessor = this.config.get('plot.x.accessor')
    let xMin = this.params.xScale.invert(range[0])
    let xMax = this.params.xScale.invert(range[1])
    const sScale = this.config.get('selectionScale')
    const selection = [_.floor(sScale.invert(range[0])), _.ceil(sScale.invert(range[1]))]
    this.config.set('selection', selection, {silent: true})

    // TODO navigation should not know anything about the data it operates
    if (_.isDate(xMin)) xMin = xMin.getTime()
    if (_.isDate(xMax)) xMax = xMax.getTime()

    const data = {[xAccessor]: [xMin, xMax]}
    actionman.fire('Zoom', this.config.get('updateComponents'), data)
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
    const p = this._compositeYChartView.params
    this.params.xScale = p.axis.x.scale
    this._brush.container = this.el
    this.config.set('xRange', p.xRange, {silent: true})
    this.config.set('yRange', p.yRange, {silent: true})
    this._brush.config.set({
      selection: this.config.selectionRange,
      xRange: p.xRange,
      yRange: p.yRange,
    }, {silent: true})
    this._brush.render()
    this._ticking = false
  }
}
