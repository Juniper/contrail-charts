/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {components} from 'contrail-charts'
import {fixture} from 'commons'

const length = 20
const data = fixture({
  length: length,
  data: {
    'group.x': {linear: true, range: [0, length]},
    'group.a': {linear: true, range: [3, (length - 1) * 3]},
    b: {linear: true, range: [5, (length - 1) * 5], repeat: true},
    c: {linear: true, range: [7, (length - 1) * 7]},
  },
})

let chart
const container = document.querySelector('#chartBox')
const config = {
  margin: {
    left: 20,
    right: 20,
  },
  x: {
    accessor: 'group.x',
    labelFormatter: 'Value',
    domain: [5, length],
  },
  y: [
    {
      accessor: 'group.a',
      labelFormatter: 'Label Group.A',
    }, {
      accessor: 'b',
      labelFormatter: 'Label B',
      color: d => d.group.a > 50 ? 'red' : undefined
    }
  ]
}

export default {
  render: () => {
    chart = new components.StackedBarView({config, container})
    chart.setData(data)

    setTimeout(() => {
      config.y.push({
        accessor: 'c',
        labelFormatter: 'Label C',
      })
      chart.setConfig(config)
    }, 1000)
    setTimeout(() => {
      config.y[1].enabled = false
      config.x.domain = [0, length]
      chart.setConfig(config)
    }, 2000)
    setTimeout(() => {
      const length = _.random(3, 20)
      chart.setData(data.slice(0, length))
    }, 3000)
  },
  remove: () => {
    chart.remove()
  }
}
