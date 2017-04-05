/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {components, Util} from 'coCharts'
import {_c, fixture} from 'commons'

const data = fixture({
  length: 40,
  data: {
    'group.x': {linear: true, range: [1475760930000, 1475800930000]},
    'group.data1': {random: true, range: [0, 50], gap: true},
    'group.size1': {random: true, range: [0, 10]},
  },
})

const colorScheme = _c.bubbleColorScheme6
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
    color: colorScheme[0],
  },
  size: {
    accessor: 'group.size1',
    range: [undefined, 100],
  }
}

export default {
  render: () => {
    chart = chart || new components.ScatterPlotView({config, container})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
