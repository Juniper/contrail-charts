/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites, Util} from 'contrail-charts'
import {formatter, fixture} from 'commons'

const data = fixture({
  length: 50,
  data: {
    'group.x': {linear: true, range: [1475760930000, 1475800930000]},
    'group.data1': {random: true, range: [0, 50], gap: true},
    'group.size1': {random: true, range: [0, 10]},
  },
})

const bubbleShapes = Util.bubbleShapes

let chart
const config = {
  id: 'chartBox',
  components: [{
    type: 'ScatterPlot',
    config: {
      tooltip: 'tooltip-id',
      bucket: 'bucket-id',
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
        range: [200, 800],
      },
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'group.x',
        valueFormatter: formatter.extendedISOTime,
      },
      dataConfig: [{
        accessor: 'group.data1',
        labelFormatter: 'Circle',
        valueFormatter: formatter.toInteger,
      }, {
        accessor: 'group.size1',
        labelFormatter: 'Size of Circle',
        valueFormatter: formatter.toInteger,
      }]
    }
  }, {
    id: 'bucket-id',
    type: 'Bucket',
    config: {
      range: [400, 600],
      shape: bubbleShapes.circleFill,
      tooltip: 'tooltip-bucket',
    }
  }, {
    id: 'tooltip-bucket',
    type: 'Tooltip',
    config: {
      title: {
        accessor: d => 'Points in Bucket: ' + d.length,
      },
    },
  }]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
