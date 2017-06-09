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

  get angularScale () {
    return this.get('angular.scale')
  }

  get radialScale () {
    return this.get('radial.scale')
  }

  get radialAccessors () {
    return _.isArray(this.get('radial')) ? this.get('radial') : [this.get('radial')]
  }

  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, 2 * Math.PI]}, this.attributes.angular)
    // TODO calculate domain _.set(this.attributes, 'angular.calculatedDomain', angularScale.domain())
    if (!_.has(this.attributes, 'angular.scale')) {
      _.set(this.attributes, 'angular.scale', ScalableChart.getScale(model, config))
    }
    config = _.merge({
      accessor: _.map(this.radialAccessors, 'accessor'),
    }, {range: [0, Math.min(width / 2, height / 2)]}, this.attributes.radial)
    // TODO handle multiple r accessors
    /*
    const radialScale = ScalableChart.getScale(model, config)
    _.each(this.radialAccessors, a => {
      if (!_.has(a, 'scale'))
      _.set(a, 'scale', radialScale)
    })
    */
    // TODO calculate domain _.set(this.attributes, 'radial.calculatedDomain', radialScale.domain())
    if (!_.has(this.attributes, 'radial.scale')) {
      _.set(this.attributes, 'radial.scale', ScalableChart.getScale(model, config))
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
    this.set('radial.color', color)
  }
}
