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
  margin: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  },
  angle: {
    accessor: 'group.x',
    labelFormatter: 'Value',
    //scale: 'scaleLinear',
  },
  r: {
    accessor: 'group.a',
    labelFormatter: 'Label Group.A',
    color: colorScheme[2],
  }
}

export default {
  render: () => {
    chart = new components.RadialLineView({config, container})
    chart.setData(data)

    setTimeout(() => {
      config.r.accessor = 'b'
      config.r.color = colorScheme[3]
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
