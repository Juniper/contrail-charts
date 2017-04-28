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
        }
      }
    )
  }

  get yAccessors () {
    return _.filter(this.get('plot.y'), a => !a.disabled)
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

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }
}
