/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'

// Data generator for developer's examples and tests
export default function (p = {}) {
  const data = []
  const length = p.length || 21
  const dataConfig = p.data || {
    t: {linear: true, range: [1475760930000, 1475800930000]},
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3]},
    b: {linear: true, range: [0, length * 5]},
    c: {linear: true, range: [0, length * 7]},
    random: {random: true, range: [0, length * 7]},
  }
  _.each(dataConfig, (config, key) => {
    if (config.linear) config.scale = d3Scale.scaleLinear().domain([0, length]).range(config.range)
    if (config.random) config.scale = d3Scale.scaleLinear().domain([0, 1]).range(config.range)
    for (let i = 0; i < length; i++) {
      let datum
      if (config.linear) datum = config.scale(i)
      if (config.random) datum = config.scale(Math.random())

      // Gap between data
      if (config.gap && i > Math.floor(length * 0.5) && i < Math.floor(length * 0.7)) continue

      // Repeating region
      if (config.repeat && i > Math.floor(length * 0.2) && i < Math.floor(length * 0.4)) {
        datum = _.get(data[i - 1], key)
      }

      data[i] = data[i] || {}
      _.set(data[i], key, datum)
    }
  })
  return data
}
