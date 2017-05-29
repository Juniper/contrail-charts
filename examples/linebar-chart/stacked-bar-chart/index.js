/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {fixture} from 'commons'

const length = 20
const data = fixture({
  length,
  data: {
    'group.x': {linear: true, range: [0, length]},
    'group.a': {linear: true, range: [3, (length - 1) * 3]},
    'group.b': {linear: true, range: [4, (length - 1) * 4]},
    'group.c': {linear: true, range: [-3, (length - 1) * -3]},
    b: {linear: true, range: [5, (length - 1) * 5], repeat: true},
    c: {linear: true, range: [7, (length - 1) * 7]},
  },
})

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'grouped-bar-compositey',
    type: 'CompositeY',
    config: {
      crosshair: 'crosshair-id',
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
            chart: 'StackedBar',
            stack: 'positive',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'group.b',
            labelFormatter: 'Label Group.B',
            chart: 'StackedBar',
            stack: 'positive',
            axis: 'y1',
            tooltip: 'default-tooltip',
          //}, {
            //accessor: 'group.c',
            //labelFormatter: 'Label Group.C',
            //chart: 'StackedBar',
            //stack: 'negative',
            //axis: 'y1',
            //tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
        },
        y2: {
          position: 'right',
        },
      },
    },
  }, {
    id: 'crosshair-id',
    type: 'Crosshair',
    config: {
      tooltip: 'default-tooltip',
    }
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
