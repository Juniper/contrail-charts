/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {components} from 'coCharts'
import {fixture} from 'commons'
import {schemeCategory10 as colorScheme} from 'd3-scale'

const length = 20
const data = fixture({
  length: length,
  data: {
    'group.x': {linear: true, range: [0, length]},
    'group.a': {linear: true, range: [3, (length - 1) * 3]},
  },
})

const container = document.querySelector('#chartBox')
const config = {
  height: 200,
  margin: {
    left: 10,
  },
  x: {
    accessor: 'group.x',
    labelFormatter: 'Value',
    scale: 'scaleLinear',
  },
  y: {
    accessor: 'group.a',
    labelFormatter: 'Label Group.A',
    color: colorScheme[2],
  }
}

let chart

export default {
  render: () => {
    chart = chart || new components.LineView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
