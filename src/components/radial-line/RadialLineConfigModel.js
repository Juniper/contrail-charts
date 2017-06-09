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
        radial: {
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
    // check if user provided a scale in config
    if (!_.has(this.attributes, 'angular.providedScale')) {
      _.set(this.attributes, 'angular.providedScale', _.has(this.attributes, 'angular.scale'))
    }
    if (!_.has(this.attributes, 'radial.providedScale')) {
      _.set(this.attributes, 'radial.providedScale', _.has(this.attributes, 'radial.scale'))
    }

    _.set(this.attributes, 'angular.calculatedDomain', ScalableChart.getCalculatedDomain(model, config))
    if (!_.has(this.attributes, 'angular.scale') || !this.attributes.angular.providedScale) {
      _.set(this.attributes, 'angular.scale', ScalableChart.getScale(model, config))
    }
    config = _.extend({range: [0, Math.min(width / 2, height / 2)]}, this.attributes.radial)
    _.set(this.attributes, 'radial.calculatedDomain', ScalableChart.getCalculatedDomain(model, config))
    if (!_.has(this.attributes, 'radial.scale') || !this.attributes.radial.providedScale) {
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
