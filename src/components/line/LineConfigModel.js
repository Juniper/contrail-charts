/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import * as d3Shape from 'd3-shape'
import ConfigModel from 'config-model'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class LineConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      {
        isSharedContainer: true,
        curve: d3.curveMonotoneX,
        y: {
          color: 'steelblue',
        },

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
  calculateScales (model) {
    let config = this.attributes.x
    _.set(this.attributes, 'x.scale', ScalableChart.getScale(model, config))
    config = this.attributes.y
    _.set(this.attributes, 'y.scale', ScalableChart.getScale(model, config))
  }

  getColor () {
    return this.get('y.color')
  }

  setColor (accessorName, color) {
    this.set('y.color', color)
  }
}
