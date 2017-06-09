/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
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
  angular: {
    accessor: 'group.x',
    labelFormatter: 'Value',
    //scale: 'scaleLinear',
  },
  radial: {
    accessor: 'group.a',
    labelFormatter: 'Label Group.A',
    color: colorScheme[2],
  }
}

export default {
  render: () => {
    chart = new components.RadialLineView({config, container})
    chart.setData(data)
  },

  remove: () => {
    chart.remove()
  }
}
