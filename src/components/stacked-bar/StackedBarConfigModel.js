/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class StackedBarConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      ColoredChart.defaults,
      {
        isSharedContainer: true,
        // Padding between series in percents of bar width
        barPadding: 15,
      })
  }

  get yAccessors () {
    return _.filter(this.attributes.y, a => !(a.enabled === false))
  }
  /**
   * @return {Array} all y accessors
   */
  get accessors () {
    return this.attributes.y
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

  getOuterWidth (model, width) {
    return ScalableChart.outerWidth(width, model, this.get('x.accessor'), this.xScale)
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model) {
    let config = this.attributes.x
    _.set(this.attributes, 'x.scale', ScalableChart.getScale(model, config))

    config = _.merge({}, this.attributes.y, {
      stacked: true,
      accessor: _.map(this.yAccessors, 'accessor'),
    })
    _.set(this.attributes, 'y.scale', ScalableChart.getScale(model, config))
  }
  /**
   * @param {Object} data may be used to assign color to individual bar based on its value
   */
  getColor (accessorName, data) {
    const accessor = _.find(this.yAccessors, {accessor: accessorName})
    const configured = ColoredChart.getColor(data, accessor)
    return configured || this.attributes.colorScale(accessorName)
  }
  // TODO
  setColor () {
  }
  // TODO
  setKey () {
  }
}
