/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'coCharts'
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
    bottom: 20,
    left: 60,
    right: 30,
    top: 10,
  },
  plot: {
    x: {
      accessor: 'group.x',
      labelFormatter: 'Value',
      axis: 'x',
    },
    y: [
      {
        accessor: 'group.a',
        labelFormatter: 'Label Group.A',
        chart: 'Line',
        axis: 'y1',
      }, {
        accessor: 'b',
        labelFormatter: 'Label B',
        chart: 'Line',
        axis: 'y1',
      }, {
        accessor: 'c',
        labelFormatter: 'Label C',
        chart: 'Line',
        axis: 'y2',
      }
    ]
  },
  axes: {
    x: {
      scale: 'scaleLinear',
      label: 'X',
    },
    y1: {
    },
    y2: {
      position: 'right',
    },
  },
}

export default {
  render: () => {
    // Create new chart with config if it's available
    // chart.setConfig is designed for chart update already rendered with data
    chart = new composites.CompositeYView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
