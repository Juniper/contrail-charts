/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import * as d3Shape from 'd3-shape'
import ConfigModel from 'config-model'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class RadialLineConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      {
        isSharedContainer: true,
        curve: d3Shape.curveCatmullRom.alpha(0.5),
        r: {
          color: 'steelblue',
        },

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
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, 2 * Math.PI]}, this.attributes.angular)
    // TODO angular.scale may have been provided by composite or by user - in this we do not want to overwrite
    // but it might have also been here from a previous render - in this case we want to overwrite - eg. after window was rescaled
    // still dont know how to solve it.
    // TODO calculate domain _.set(this.attributes, 'angular.calculatedDomain', angularScale.domain())
    if (!_.has(this.attributes, 'angular.scale')) {
      _.set(this.attributes, 'angular.scale', ScalableChart.getScale(model, config))
    }
    config = _.extend({range: [0, Math.min(width / 2, height / 2)]}, this.attributes.radial)
    // TODO calculate domain  _.set(this.attributes, 'radial.calculatedDomain', radialScale.domain())
    if (!_.has(this.attributes, 'radial.scale')) {
      _.set(this.attributes, 'radial.scale', ScalableChart.getScale(model, config))
    }
  }

  getColor () {
    return this.get('radial.color')
  }

  setColor (accessorName, color) {
    this.set('radial.color', color)
  }
}
