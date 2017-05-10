/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import ConfigModel from 'config-model'

export default class BucketConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, {
      isSharedContainer: true,
      // range start 256 - is an area of 16x16 square considering the default font for number of buckets as 14px
      range: [256, 512],
      scale: d3Scale.scaleLinear(),
      shape: '&#xf111;',

      // default value is set in css
      color: undefined,
    })
  }

  get scale () {
    const configRange = this.attributes.range
    const defaultRange = this.defaults.range
    const start = _.isNil(configRange[0]) ? defaultRange[0] : configRange[0]
    const end = _.isNil(configRange[1]) ? defaultRange[1] : configRange[1]
    return this.attributes.scale.range([start, end])
  }

  get duration () {
    return this._parent.get('duration') || this.attributes.duration
  }

  get xAccessor () {
    return this._parent.get('plot.x.accessor')
  }

  get updateComponents () {
    return this._parent.get('updateComponents')
  }
}
