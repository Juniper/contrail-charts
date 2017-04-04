/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class GroupedBarConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults,
      ScalableChart.defaults,
      ColoredChart.defaults,
      {
        // Padding between series in percents of bar width
        barPadding: 15,
      })
  }

  get yAccessors () {
    return _.filter(this.attributes.y, a => !(a.enabled === false))
  }

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
  }

  set (...args) {
    super.set(ColoredChart.set(...args))
  }

  getOuterWidth (model, width) {
    return ScalableChart.outerWidth(width, model, this.get('x.accessor'), this.get('x.scale'))
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, width]}, this.attributes.x)
    this.attributes.x.scale = ScalableChart.getScale(model, config)
    config = { range: [height, 0], accessor: _.map(this.attributes.y, 'accessor') }
    this.attributes.y.scale = ScalableChart.getScale(model, config)
  }

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }
}
