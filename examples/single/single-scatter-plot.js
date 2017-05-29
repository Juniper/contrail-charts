/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {components, Util} from 'contrail-charts'
import {fixture} from 'commons'

const data = fixture({
  length: 40,
  data: {
    'group.x': {linear: true, range: [1475760930000, 1475800930000]},
    'group.data1': {random: true, range: [0, 50], gap: true},
    'group.size1': {random: true, range: [0, 10]},
  },
})

const bubbleShapes = Util.bubbleShapes

let chart
const container = document.querySelector('#chartBox')
const config = {
  height: 450,
  x: {
    accessor: 'group.x',
  },
  y: {
    accessor: 'group.data1',
    shape: bubbleShapes.circle,
    color: d => d.group.size1 > 8 ? 'red' : null
  },
  size: {
    accessor: 'group.size1',
  }
}

export default {
  render: () => {
    chart = new components.ScatterPlotView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
