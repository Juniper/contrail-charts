/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class RadialBarConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      {
        isSharedContainer: true,
        r: {
          color: 'steelblue',
        },
        // Padding between series in percents of bar width
        barPadding: 15,

        //scale - calculated from data domain and available plot area size
      }
    )
  }

  get angleScale () {
    return this.get('angle.scale')
  }

  get rScale () {
    return this.get('r.scale')
  }

  get rAccessors () {
    return _.isArray(this.get('r')) ? this.get('r') : [this.get('r')]
  }

  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, 2 * Math.PI]}, this.attributes.angle)
    // TODO calculate domain _.set(this.attributes, 'angle.calculatedDomain', angleScale.domain())
    if (!_.has(this.attributes, 'angle.scale')) {
      _.set(this.attributes, 'angle.scale', ScalableChart.getScale(model, config))
    }
    config = _.merge({
      accessor: _.map(this.rAccessors, 'accessor'),
    }, {range: [0, Math.min(width / 2, height / 2)]}, this.attributes.r)
    // TODO handle multiple r accessors
    /*
    const rScale = ScalableChart.getScale(model, config)
    _.each(this.rAccessors, a => {
      if (!_.has(a, 'scale'))
      _.set(a, 'scale', rScale)
    })
    */
    // TODO calculate domain _.set(this.attributes, 'r.calculatedDomain', rScale.domain())
    if (!_.has(this.attributes, 'r.scale')) {
      _.set(this.attributes, 'r.scale', ScalableChart.getScale(model, config))
    }
  }

  /**
   * @param {Object} data may be used to assign color to individual bar based on its value
   */
  getColor (accessor, data) {
    const configured = ColoredChart.getColor(data, accessor)
    return configured || this.attributes.colorScale(accessor.accessor)
  }

  setColor (accessorName, color) {
    this.set('r.color', color)
  }
}
