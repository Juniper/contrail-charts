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
    'group.a': {random: true, range: [0, length * 3]},
    b: {random: true, range: [0, (length - 1) * -5]},
    c: {linear: true, range: [-5, (length - 1) * -5]},
  },
})

let chart
const container = document.querySelector('#chartBox')
const config = {
  x: {
    accessor: 'group.x',
    labelFormatter: 'Value',
  },
  y: [
    {
      accessor: 'group.a',
      stack: 'positive',
      labelFormatter: 'Label Group.A',
      color: colorScheme[2],
    }, {
      accessor: 'b',
      stack: 'negative',
      labelFormatter: 'Label B',
      color: colorScheme[3],
    }, {
      accessor: 'c',
      stack: 'negative',
      color: colorScheme[4],
    }
  ]
}

export default {
  render: () => {
    chart = new components.AreaView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
