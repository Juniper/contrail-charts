/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import {bubbleShapes} from 'core/Util'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class ScatterPlotConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      ColoredChart.defaults,
      {
        isSharedContainer: true,
        shape: bubbleShapes.circleFill,
        size: {
          range: [1, 500],
        },
      })
  }

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
  }

  get sizeScale () {
    return this.get('size.scale')
  }

  set (...args) {
    ColoredChart.set(...args)
    super.set(...args)
  }

  getOuterWidth (model, width) {
    return ScalableChart.outerWidth(width, model, this.get('x.accessor'), this.get('x.scale'))
  }

  calculateScales (model, width, height) {
    let config = _.extend({range: [0, width]}, this.attributes.x)
    _.set(this.attributes, 'x.scale', ScalableChart.getScale(model, config))

    config = _.merge({}, this.attributes.y, {range: [height, 0]})
    _.set(this.attributes, 'y.scale', ScalableChart.getScale(model, config))

    if (this.get('size.accessor')) {
      config = _.extend({}, this.attributes.size)
      _.set(this.attributes, 'size.scale', ScalableChart.getScale(model, config))
    }
  }
  /**
   * @param {Object} data may be used to assign color to individual bubbles based on its value
   */
  getColor (accessorName, data) {
    const configured = ColoredChart.getColor(data, this.get('y'))
    return configured || this.attributes.colorScale(accessorName)
  }
  // TODO
  setColor () {
  }
}
