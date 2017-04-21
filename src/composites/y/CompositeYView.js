/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import CompositeChart from 'helpers/CompositeChart'
import AxisConfigModel from 'components/axis/AxisConfigModel'
import Config from './CompositeYConfigModel'

export default class CompositeYView extends ContrailChartsView {
  static get Config () { return Config }
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.child',
      axis: '.axis',
    })
  }

  setConfig (config) {
    if (!this._composite) this._composite = new CompositeChart()
    super.setConfig(config)
  }

  render () {
    super.render()
    this._plotMargin = _.cloneDeep(this.config.get('margin'))
    _.each(this.config.get('axes'), (config, name) => {
      config.position = config.position || AxisConfigModel.defaultPosition(name)
      this._plotMargin[config.position] += this._plotMargin.label
    })

    // TODO consider stacked charts change scale depending on data
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
    this._renderAxes()
    this._updateComponents()

    this._ticking = false
  }
  /**
   * Render axes and calculate inner margins for charts
   */
  _renderAxes () {
    let ticks = {}
    const plotYAxes = _(this.config.yAccessors).map('axis').uniq().value()
    const axes = _.filter(this.config.get('axes'), (axis, name) => {
      axis.name = name
      return name.startsWith('x') || plotYAxes.includes(name)
    })

    const elements = this.svg.selectAll(this.selectors.axis)
      .data(axes, d => d.name)

    elements.enter().each(axis => {
      const config = _.extend({
        id: `${this.id}-${axis.name}`,
        name: axis.name,
        margin: this._plotMargin,
        accessors: this.config.getAxisAccessors(axis.name),
      }, axis)

      // Sync ticks of the axes in the same direction
      const direction = AxisConfigModel.getDirection(config.position)
      if (ticks[direction]) config.tickCoords = ticks[direction]
      else ticks[direction] = _.map(config.scale.ticks(), v => config.scale(v))

      const component = this._composite.add({
        type: 'Axis',
        config,
        container: this._container,
      })
      component.el.__data__ = axis
    })

    elements.each(axis => {
      const component = this._composite.get(`${this.id}-${axis.name}`)

      const config = _.extend({
        margin: this._plotMargin,
        accessors: this.config.getAxisAccessors(axis.name),
      }, axis)

      // Sync ticks of the axes in the same direction
      const direction = component.config.direction
      if (ticks[direction]) config.tickCoords = ticks[direction]
      else ticks[direction] = _.map(config.scale.ticks(), v => config.scale(v))
      // if only a scale is changed Backbone doesn't trigger "change" event and no render will happen
      component.config.set(config, {silent: true})
      component.render()
    })

    elements.exit().each(axis => {
      this._composite.remove(`${this.id}-${axis.name}`)
    })
  }

  _updateComponents (p) {
    const config = {
      // all sub charts should not react on model change as some preparation for them is done here
      frozen: true,
      // TODO add axes space to the chart margins
      margin: this._plotMargin,
      width: this.width,
      height: this.height,
      x: {
        accessor: this.config.get('plot.x.accessor'),
        scale: this.config.get('axes.x.scale'),
      }
    }
    const children = this.svg.selectAll(this.selectors.node)
      .data(this.config.yAccessors, d => d.accessor)

    children.enter().each(accessor => {
      config.id = `${this.id}-${accessor.accessor}`
      config.y = {
        accessor: accessor.accessor,
        scale: this.config.get(`axes.${accessor.axis}.scale`),
      }

      const component = this._composite.add({
        type: this.config.getComponentType(accessor),
        config,
        model: this.model,
        container: this._container,
      })
      component.render()
      component.d3.classed(this.selectorClass('node'), true)
      component.el.__data__ = accessor
    })

    children.each(accessor => {
      config.y = {
        accessor: accessor.accessor,
        scale: this.config.get(`axes.${accessor.axis}.scale`),
      }
      let component = this._composite.get(`${this.id}-${accessor.accessor}`)
      component.config.set(config)
      component.render()
    })

    children.exit().each(accessor => {
      this._composite.remove(`${this.id}-${accessor.accessor}`)
    })
  }
}
