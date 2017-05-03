/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class CompositeYConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.defaultsDeep(super.defaults,
      ColoredChart.defaults,
      {
        margin: {
          label: 15,
        },
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
   * @return {Array} all y accessors
   */
  get accessors () {
    return this.get('plot.y')
  }

  get children () {
    const accessorsByChart = _.groupBy(this.yAccessors, accessor => {
      return `${accessor.axis}-${accessor.stack || (accessor.chart === 'Line' ? accessor.accessor : accessor.chart)}`
    })
    return _.map(accessorsByChart, (accessors, key) => { return {key, accessors} })
  }

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
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

  getAxisAccessors (name) {
    return _.filter(this.get('plot.y'), accessor => accessor.axis === name)
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    const config = _.extend({range: [0, width]}, this.get('plot.x'), this.get('axes.x'))
    _.set(this.attributes, 'axes.x.scale', ScalableChart.getScale(model, config))

    const accessorsByAxis = _.groupBy(this.get('plot.y'), 'axis')
    _.each(accessorsByAxis, (accessors, axisName) => {
      const accessorNames = _.map(accessors, 'accessor')
      const config = _.extend(
        {
          domain: this.get(`axes.${axisName}.calculatedDomain`),
          range: [height, 0],
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

  setAccessor (accessorName, isEnabled) {
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
        return barCharts.includes(a.chart) && a.axis === accessor.axis && a !== accessor
      }))
    }

    // TODO should fire SelectChartType action for all extra accessors changed
    _.each(toUpdate, accessor => { accessor.chart = type })
    this.trigger('change')
  }
  /**
   * Sync ticks of the scales in the same direction
   */
  _syncScales (direction, scale) {
    if (this.attributes.ticks[direction]) return this.attributes.ticks[direction]
    else this.attributes.ticks[direction] = _.map(scale.ticks(), v => scale(v))
  }
}
