/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class CompositeYConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults,
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

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
  }

  getComponentType (accessor = {}) {
    return accessor.chart || 'Line'
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
      const config = _.defaultsDeep(
        {
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
