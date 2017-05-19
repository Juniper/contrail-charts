/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {components} from 'contrail-charts'
import {fixture} from 'commons'
import {schemeCategory10 as colorScheme} from 'd3-scale'

const length = 20
const data = fixture({
  length: length,
  data: {
    'group.x': {linear: true, range: [0, length]},
    'group.a': {linear: true, range: [3, (length - 1) * 3]},
    b: {random: true, range: [0, -length * 5]},
  },
})

let chart
const container = document.querySelector('#chartBox')
const config = {
  height: 200,
  margin: {
    left: 10,
  },
  x: {
    accessor: 'group.x',
    scale: 'scaleLinear',
  },
  y: {
    accessor: 'group.a',
    color: colorScheme[2],
  }
}

export default {
  render: () => {
    chart = new components.LineView({config, container})
    chart.setData(data)

    setTimeout(() => {
      config.y.accessor = 'b'
      config.y.color = colorScheme[3]
      chart.setConfig(config)
    }, 1000)
    setTimeout(() => {
      const length = _.random(3, 20)
      chart.setData(data.slice(0, length))
    }, 2000)
  },
  remove: () => {
    chart.remove()
  }
}
