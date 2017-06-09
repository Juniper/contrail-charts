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
            angularAxis: 'angularAxis',
            radialAxis: 'radialAxis',
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
  get activeAngularAxes () {
    const angularAxisNames = _(this.activeAccessors).map(a => this.getAngularAxisName(a)).uniq().value()
    return _.filter(this.attributes.axes, (axis, name) => {
      const includes = angularAxisNames.includes(name)
      if (includes) {
        axis.id = `${this.id}-${name}`
        axis.name = name
        axis.position = 'angular'
      }
      return includes
    })
  }

  get activeRadialAxes () {
    const radialAxisNames = _(this.activeAccessors).map(a => this.getRadialAxisName(a)).uniq().value()
    return _.filter(this.attributes.axes, (axis, name) => {
      const includes = radialAxisNames.includes(name)
      if (includes) {
        axis.id = `${this.id}-${name}`
        axis.name = name
        axis.position = 'radial'
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
    return `${accessor.angular}-${accessor.radial}`
  }

  getAngularAxisName (accessor) {
    return accessor.angularAxis || 'angularAxis'
  }

  getRadialAxisName (accessor) {
    return accessor.radialAxis || 'radialAxis'
  }

  getOtherAxisName (position, accessor) {
    if (position === 'radial') {
      return this.getAngularAxisName(accessor)
    } else {
      return this.getRadialAxisName(accessor)
    }
  }

  getAxisAccessors (name) {
    return _.filter(this.accessors, accessor => this.getAngularAxisName(accessor) === name || this.getRadialAxisName(accessor) === name)
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
    const accessorsByAngularAxis = _.groupBy(this.activeAccessors, a => this.getAngularAxisName(a))
    _.each(accessorsByAngularAxis, (accessors, axisName) => {
      const accessorNames = _(accessors).map('angular').uniq().value()
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
    const accessorsByRadialAxis = _.groupBy(this.activeAccessors, a => this.getRadialAxisName(a))
    const availableR = Math.min(width / 2, height / 2)
    _.each(accessorsByRadialAxis, (accessors, axisName) => {
      const accessorNames = _(accessors).map('radial').uniq().value()
      const config = _.extend(
        {
          domain: this.get(`axes.${axisName}.calculatedDomain`),
          range: [0, availableR],
          accessor: accessorNames
        },
        this.get(`axes.${axisName}`)
      )
      // Handle ranges given in %
      const newRange = [config.range[0], config.range[1]]
      _.each(newRange, (range, i) => {
        if (_.endsWith(range, '%')) {
          const percent = parseInt(_.trim(range, ' %'))
          newRange[i] = (percent / 100) * availableR
        }
      })
      config.range = newRange
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

  isMultiAccessor (type) {
    return ['Area', 'StackedBar', 'GroupedBar'].includes(type)
  }
}
