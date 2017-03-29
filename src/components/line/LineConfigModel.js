/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import * as d3Shape from 'd3-shape'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class LineConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults,
      ScalableChart.defaults,
      ColoredChart.defaults,
      {
        curve: d3Shape.curveCatmullRom.alpha(0.5),
      }
    )
  }

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, width]}, this.attributes.x)
    this.attributes.x.scale = ScalableChart.getScale(model, config)
    config = _.extend({range: [height, 0]}, this.attributes.y)
    this.attributes.y.scale = ScalableChart.getScale(model, config)
  }

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }
}
