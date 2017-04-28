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
    return _.defaultsDeep(super.defaults,
      ColoredChart.defaults,
      {
        isSharedContainer: true,
        curve: d3Shape.curveCatmullRom.alpha(0.5),

        //scale - calculated from data domain and available plot area size
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
    _.set(this.attributes, 'x.scale', ScalableChart.getScale(model, config))
    config = _.defaultsDeep({}, this.attributes.y, {range: [height, 0]})
    _.set(this.attributes, 'y.scale', ScalableChart.getScale(model, config))
  }

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor.accessor)
  }
}
