/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {components} from 'coCharts'
import {fixture} from 'commons'

const length = 20
const data = fixture({
  length: length,
  data: {
    'group.x': {linear: true, range: [0, length]},
    'group.a': {linear: true, range: [3, (length - 1) * 3]},
    b: {linear: true, range: [5, (length - 1) * 5], repeat: true},
  },
})

let chart
const container = document.querySelector('#chartBox')
const config = {
  margin: {
    top: 10,
  },
  x: {
    accessor: 'group.x',
    labelFormatter: 'Value',
  },
  y: [
    {
      accessor: 'group.a',
      labelFormatter: 'Label Group.A',
    }, {
      accessor: 'b',
      labelFormatter: 'Label B',
    }
  ]
}

export default {
  render: () => {
    chart = new components.GroupedBarView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}