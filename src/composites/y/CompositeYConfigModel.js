/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'
import AxisConfigModel from 'components/axis/AxisConfigModel'

export default class CompositeYConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      ColoredChart.defaults,
      {
        margin: {
          top: 8,
          left: 8,
          bottom: 8,
          right: 8,
          label: 16,
        },
        isPrimary: true,
        isSharedContainer: true,

        // default chart type to plot
        chart: 'Line',
        plot: {
          x: {
            // Default x axis name
            axis: 'x',
          },
          y: {
            // Default y axis name.
            axis: 'y',
          }
        },
        ticks: {},
      }
    )
  }
  /**
   * @return {Array} all enabled y accessors
   */
  get yAccessors () {
    return _.filter(this.get('plot.y'), a => !a.disabled)
  }
  /**
   * TODO update name to considering that this is only y accessors with no filter for disabled
   * @return {Array} all y accessors
   */
  get accessors () {
    return this.get('plot.y')
  }

  get children () {
    const accessorsByChart = _.groupBy(this.yAccessors, accessor => {
      const axis = this.getAxisName(accessor)
      return `${axis}-${this.isMultiAccessor(accessor.chart) ? accessor.chart : accessor.accessor}`
    })
    return _.map(accessorsByChart, (accessors, key) => { return {key, accessors} })
  }

  get xScale () {
    return this.get(`axes.${this.get('plot.x.axis')}.scale`)
  }
  // TODO should this return all scales or just first?
  get yScales () {
    return _.find(this.get('axes'), a => a.name.startsWith('y')).scale
  }
  /**
   * Value depends on what is axis label or how many accessors plus label for axis values
   */
  get margin () {
    const margin = _.cloneDeep(this.attributes.margin)
    _.each(this.attributes.axes, (config, name) => {
      // TODO move to set method
      config.position = config.position || AxisConfigModel.defaultPosition(name)

      const labelCount = this.get(`axes.${name}.label`) ? 2 : this.getAxisAccessors(name, true).length + 1
      margin[config.position] += margin.label * labelCount
    })
    return margin
  }
  /**
   * @return axes with enabled accessors to plot
   */
  get activeAxes () {
    const plotYAxes = _(this.yAccessors).map(a => this.getAxisName(a)).uniq().value()
    return _.filter(this.attributes.axes, (axis, name) => {
      // TODO move to set method
      axis.id = `${this.id}-${name}`
      axis.name = name
      return name.startsWith('x') || plotYAxes.includes(name)
    })
  }

  set (...args) {
    ColoredChart.set(...args)
    super.set(...args)
  }
  /**
   * @param {Object} accessors element of array returned by this.children
   */
  getComponentType (accessors = [{}]) {
    _.isArray(accessors) || (accessors = [accessors])
    return accessors[0].chart || 'Line'
  }

  getAxisName (accessors = [{}]) {
    _.isArray(accessors) || (accessors = [accessors])
    return accessors[0].axis || 'y'
  }
  /**
   * @param {Boolean} filterActive
   * @return {Array} accessors by axis name
   */
  getAxisAccessors (name, filterActive) {
    if (name.startsWith('x')) return [this.get('plot.x.accessor')]
    return _.filter(this.get('plot.y'), accessor => {
      return this.getAxisName(accessor) === name && (!filterActive || !accessor.disabled)
    })
  }

  getAxisConfig (name) {
    const axis = this.get('axes.' + name)
    const direction = AxisConfigModel.getDirection(axis.position)
    const config = _.extend({
      margin: this.margin,
      height: this.attributes.height,
      width: this.attributes.width,
      accessors: this.getAxisAccessors(name, true),
      tickCoords: this.syncScales(direction, axis.scale, axis.ticks)
    }, axis)
    return config
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model) {
    const config = _.extend({}, this.get('plot.x'), this.get('axes.x'))
    _.set(this.attributes, 'axes.x.scale', ScalableChart.getScale(model, config))

    const accessorsByAxis = _.groupBy(this.get('plot.y'), a => this.getAxisName(a))
    _.each(accessorsByAxis, (accessors, axisName) => {
      const accessorNames = _.map(accessors, 'accessor')
      const config = _.extend(
        {
          domain: this.get(`axes.${axisName}.calculatedDomain`),
          accessor: accessorNames
        },
        this.get('axes.' + axisName)
      )
      _.set(this.attributes, `axes.${axisName}.scale`, ScalableChart.getScale(model, config))
    })
  }

  getColor (accessorName) {
    const configured = _.find(this.accessors, {accessor: accessorName}).color
    return configured || this.attributes.colorScale(accessorName)
  }

  setColor (accessorName, color) {
    const accessor = _.find(this.accessors, {accessor: accessorName})
    if (!accessor) return
    accessor.color = color
    this.trigger('change')
  }

  setKey (accessorName, isEnabled) {
    const accessor = _.find(this.accessors, a => a.accessor === accessorName)
    if (!accessor) return
    accessor.disabled = !isEnabled
    this.trigger('change')
  }
  /**
   * Changing anyone chart type from GroupedBar to StackedBar or vise versa will affect all bars for no bars overlap
   * @param accessorName
   * @param type
   */
  setChartType (accessorName, type) {
    const barCharts = ['GroupedBar', 'StackedBar']
    const accessor = _.find(this.accessors, {accessor: accessorName})
    if (!accessor) return
    const toUpdate = [accessor]
    if (barCharts.includes(type)) {
      toUpdate.push(..._.filter(this.accessors, a => {
        return barCharts.includes(a.chart) && this.getAxisName(a) === this.getAxisName(accessor) && a !== accessor
      }))
    }

    // TODO should fire SelectChartType action for all extra accessors changed
    _.each(toUpdate, accessor => { accessor.chart = type })
    this.trigger('change')
  }
  /**
   * Sync ticks of the scales in the same direction
   */
  syncScales (direction, scale, ticksAmount) {
    const attributes = this.attributes
    attributes.ticks || (attributes.ticks = {})
    if (attributes.ticks[direction]) return attributes.ticks[direction]
    else attributes.ticks[direction] = _.map(scale.ticks(ticksAmount), v => scale(v))
  }

  isMultiAccessor (type) {
    return ['Area', 'StackedBar', 'GroupedBar'].includes(type)
  }
}
