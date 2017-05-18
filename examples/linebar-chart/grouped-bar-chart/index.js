/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
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
const config = {
  id: 'chartBox',
  components: [{
    id: 'stacked-bar-compositey',
    type: 'CompositeY',
    config: {
      plot: {
        x: {
          accessor: 'group.x',
          labelFormatter: 'Value',
          axis: 'x',
        },
        y: [
          {
            accessor: 'group.a',
            chart: 'GroupedBar',
            labelFormatter: 'Label Group.A',
            tooltip: 'default-tooltip',
            axis: 'y1',
          }, {
            accessor: 'b',
            chart: 'GroupedBar',
            labelFormatter: 'Label B',
            tooltip: 'default-tooltip',
            axis: 'y1',
          }, {
            accessor: 'c',
            chart: 'GroupedBar',
            labelFormatter: 'Label C',
            tooltip: 'default-tooltip',
            axis: 'y1',
          }
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
          position: 'left',
        },
      },
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'group.x',
          labelFormatter: 'Value',
        }, {
          accessor: 'group.a',
          labelFormatter: 'Tooltip Group.A',
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
        }
      ]
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
