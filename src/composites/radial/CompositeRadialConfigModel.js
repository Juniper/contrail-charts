/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class CompositeRadialConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      ColoredChart.defaults,
      {
        margin: {
          top: 10,
          left: 40,
          bottom: 40,
          right: 15,
          label: 15,
        },
        isPrimary: true,
        isSharedContainer: true,

        // default chart type to plot
        chart: 'RadialLine',
        accessors: [
          {
            angleAxis: 'angleAxis',
            rAxis: 'rAxis',
          }
        ],
        ticks: {},
      }
    )
  }

  /**
   * @return {Array} all enabled accessors
   */
  get activeAccessors () {
    return _.filter(this.accessors, a => !a.disabled)
  }

  /**
   * @return {Array} all y accessors
   */
  get accessors () {
    return this.get('accessors')
  }

  get children () {
    return _.map(this.activeAccessors, (accessor) => {
      const key = this.getAccessorKey(accessor)
      return {key, accessor}
    })
  }

  get margin () {
    return _.cloneDeep(this.attributes.margin)
  }
  /**
   * @return axes with enabled accessors to plot
   */
  get activeAngleAxes () {
    const angleAxisNames = _(this.activeAccessors).map(a => this.getAngleAxisName(a)).uniq().value()
    return _.filter(this.attributes.axes, (axis, name) => {
      const includes = angleAxisNames.includes(name)
      if (includes) {
        axis.id = `${this.id}-${name}`
        axis.name = name
        axis.position = 'angle'
      }
      return includes
    })
  }

  get activeRAxes () {
    const rAxisNames = _(this.activeAccessors).map(a => this.getRAxisName(a)).uniq().value()
    return _.filter(this.attributes.axes, (axis, name) => {
      const includes = rAxisNames.includes(name)
      if (includes) {
        axis.id = `${this.id}-${name}`
        axis.name = name
        axis.position = 'r'
      }
      return includes
    })
  }

  set (...args) {
    ColoredChart.set(...args)
    super.set(...args)
  }

  /**
   * @param {Object} accessors element of array returned by this.children
   */
  getComponentType (accessor) {
    return accessor.chart || 'RadialLine'
  }

  getAccessorKey (accessor) {
    return `${accessor.angle}-${accessor.r}`
  }

  getAngleAxisName (accessor) {
    return accessor.angleAxis || 'angleAxis'
  }

  getRAxisName (accessor) {
    return accessor.rAxis || 'rAxis'
  }

  getOtherAxisName (position, accessor) {
    if (position === 'r') {
      return this.getAngleAxisName(accessor)
    } else {
      return this.getRAxisName(accessor)
    }
  }

  getAxisAccessors (name) {
    return _.filter(this.accessors, accessor => this.getAngleAxisName(accessor) === name || this.getRAxisName(accessor) === name)
  }

  getAxisConfig (name) {
    const axis = this.get('axes.' + name)
    const config = _.extend({
      margin: this.margin,
      height: this.attributes.height,
      width: this.attributes.width,
      accessors: this.getAxisAccessors(name),
    }, axis)
    config.otherAxisNames = _(_.map(config.accessors, a => this.getOtherAxisName(config.position, a))).uniq().value()
    config.otherAxisScales = _.map(config.otherAxisNames, axisName => this.get('axes.' + axisName).scale)
    return config
  }

  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    const accessorsByAngleAxis = _.groupBy(this.activeAccessors, a => this.getAngleAxisName(a))
    _.each(accessorsByAngleAxis, (accessors, axisName) => {
      const accessorNames = _(accessors).map('angle').uniq().value()
      const config = _.extend(
        {
          domain: this.get(`axes.${axisName}.calculatedDomain`),
          range: [0, 2 * Math.PI],
          accessor: accessorNames
        },
        this.get(`axes.${axisName}`)
      )
      _.set(this.attributes, `axes.${axisName}.scale`, ScalableChart.getScale(model, config))
    })
    const accessorsByRAxis = _.groupBy(this.activeAccessors, a => this.getRAxisName(a))
    const availableR = Math.min(width / 2, height / 2)
    _.each(accessorsByRAxis, (accessors, axisName) => {
      const accessorNames = _(accessors).map('r').uniq().value()
      const config = _.extend(
        {
          domain: this.get(`axes.${axisName}.calculatedDomain`),
          range: [0, availableR],
          accessor: accessorNames
        },
        this.get(`axes.${axisName}`)
      )
      // Handle ranges given in %
      _.each(config.range, (range, i) => {
        if (_.endsWith(range, '%')) {
          const percent = parseInt(_.trim(range, ' %'))
          config.range[i] = (percent / 100) * availableR
        }
      })
      _.set(this.attributes, `axes.${axisName}.scale`, ScalableChart.getScale(model, config))
    })
  }

  getColor (accessor) {
    const configured = accessor.color
    return configured || this.attributes.colorScale(accessor.accessor)
  }

  setColor (accessorName, color) {
    const accessor = _.find(this.accessors, a => this.getAccessorKey(a) === accessorName)
    if (!accessor) return
    accessor.color = color
    this.trigger('change')
  }

  setKey (accessorName, isEnabled) {
    const accessor = _.find(this.accessors, a => this.getAccessorKey(a) === accessorName)
    if (!accessor) return
    accessor.disabled = !isEnabled
    this.trigger('change')
  }

  /**
   * Changing anyone chart type from GroupedBar to StackedBar or vise versa will affect all bars for no bars overlap
   * @param accessorName
   * @param type
   */
  /*
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
  */

  isMultiAccessor (type) {
    return ['Area', 'StackedBar', 'GroupedBar'].includes(type)
  }
}
