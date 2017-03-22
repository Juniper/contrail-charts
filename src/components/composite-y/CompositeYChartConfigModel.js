/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class CompositeYChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, ColoredChart.defaults, {
      isPrimary: true,
      // by default will use common shared container under the parent
      isSharedContainer: true,

      // The chart width. If not provided will be calculated by View.
      chartWidth: undefined,

      // The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // The chart height. If not provided will be calculated by View.
      chartHeight: undefined,

      // Default axis ticks if not specified per axis.
      _xTicks: 10,
      _yTicks: 10,

      // Margin between label and chart
      labelMargin: 16,

      // Side margins.
      marginTop: 25,
      marginBottom: 40,
      marginLeft: 50,
      marginRight: 50,
      marginInner: 10,

      curve: d3Shape.curveCatmullRom.alpha(0.5),
      axisPositions: ['left', 'right', 'top', 'bottom'],
      plot: {},
      axis: {},
      // TODO move to the BarChartConfigModel
      // Padding between series in percents of bar width
      barPadding: 15,
    })
  }

  set (...args) {
    super.set(ColoredChart.set(...args))
  }
  /**
   * @param {String} name of the axis
   */
  getScale (name) {
    const axis = this.attributes.axis[name] || {}
    if (_.isFunction(axis.scale)) return axis.scale
    if (_.isFunction(d3Scale[axis.scale])) return d3Scale[axis.scale]()
    if (['bottom', 'top'].includes(this.getPosition(name))) return d3Scale.scaleTime()
    return d3Scale.scaleLinear()
  }
  /**
   * @param {String} name of the axis
   * @return {String} Axis position bottom / left
   */
  getPosition (name) {
    const axis = this.attributes.axis[name] || {}
    if (this.attributes.axisPositions.includes(axis.position)) return axis.position
    if (name.startsWith('x')) return 'bottom'
    if (name.startsWith('y')) return 'left'
  }

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }

  getAccessors () {
    return this.get('plot.y')
  }

  getDomain (axisName) {
    return this.get(`axis.${axisName}.domain`)
  }
}
