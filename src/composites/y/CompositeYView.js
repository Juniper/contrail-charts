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

  get tagName () { return 'g' }

  setData (data) {
    super.setData(data)
    this.render({silent: true})
    this._composite.setData(data)
  }

  setConfig (config) {
    if (!this._composite) this._composite = new CompositeChart({container: this._container})
    super.setConfig(config)
  }

  render (p) {
    super.render()
    this._plotMargin = _.cloneDeep(this.config.get('margin'))
    _.each(this.config.get('axes'), (config, name) => {
      config.position = config.position || AxisConfigModel.defaultPosition(name)
      this._plotMargin[config.position] += this._plotMargin.label
    })

    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
    this._renderAxes()
    this._updateComponents(p)

    this._ticking = false
  }
  /**
   * Render axes and calculate inner margins for charts
   */
  _renderAxes () {
    let ticks = {}
    _.each(this.config.get('axes'), (axisConfig, name) => {
      const config = _.extend({
        id: `${this.id}-${name}`,
        name,
        margin: this._plotMargin,
        accessors: this.config.getAxisAccessors(name),
      }, axisConfig)

      // Sync ticks of the axes in the same direction
      const direction = AxisConfigModel.getDirection(config.position)
      if (ticks[direction]) config.tickCoords = ticks[direction]
      else ticks[direction] = _.map(config.scale.ticks(), v => config.scale(v))

      const component = this._composite.get(config.id)
      if (!component) {
        this._composite.add({
          type: 'Axis',
          config,
        })
      } else {
        // if only a scale is changed Backbone doesn't trigger "change" event and no render will happen
        component.config.set(config, {silent: true})
        component.config.trigger('change')
      }
    })
  }

  _updateComponents (p) {
    const config = {
      container: this._container,
      // TODO add axes space to the chart margins
      margin: this._plotMargin,
      width: this.width,
      height: this.height,
      x: {
        accessor: this.config.get('plot.x.accessor'),
        scale: this.config.get('axes.x.scale'),
      }
    }
    _.each(this.config.yAccessors, accessor => {
      config.id = `${this.id}-${accessor.accessor}`
      config.y = {
        accessor: accessor.accessor,
        scale: this.config.get(`axes.${accessor.axis}.scale`),
      }

      const component = this._composite.get(config.id)
      if (!component) {
        this._composite.add({
          type: this.config.getComponentType(accessor),
          config,
          model: this.model,
        })
      } else component.config.set(config, p)
    })
  }
}
