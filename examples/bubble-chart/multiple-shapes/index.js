/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites, Util} from 'contrail-charts'
import {formatter, _c, fixture} from 'commons'

const data = fixture({
  length: 40,
  data: {
    'group.x': {linear: true, range: [1475760930000, 1475800930000]},
    'group.data1': {random: true, range: [0, 50], gap: true},
    data2: {random: true, range: [0, 100], repeat: true},
    data3: {random: true, range: [0, 100]},
    'group.size1': {random: true, range: [0, 10]},
    size2: {random: true, range: [0, 20]},
    nav: {random: true, range: [0, 10]},
  },
})

const colorScheme = _c.bubbleColorScheme6
const bubbleShapes = Util.bubbleShapes

let chart
const config = {
  id: 'chartBox',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'multishape-bubble-chart',
      editable: {
        colorSelector: true,
      },
    },
  }, {
    id: 'multishape-bubble-chart',
    type: 'CompositeY',
    config: {
      margin: {
        right: 60,
      },
      height: 450,
      plot: {
        x: {
          accessor: 'group.x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'group.data1',
            label: 'Data 1',
            chart: 'ScatterPlot',
            size: {
              accessor: 'group.size1',
              range: [1, 500],
            },
            // this is a circle symbol from fontawesome
            shape: bubbleShapes.circleFill,
            color: colorScheme[0],
            axis: 'y1',
            tooltip: 'tooltip-id',
          }, {
            accessor: 'data2',
            label: 'Data 2',
            chart: 'ScatterPlot',
            size: {
              accessor: 'size2',
              range: [1, 500],
            },
            shape: bubbleShapes.square,
            color: colorScheme[4],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }, {
            accessor: 'data3',
            label: 'Data 3',
            chart: 'ScatterPlot',
            size: {
              accessor: 'size2',
              range: [1, 500],
            },
            shape: bubbleShapes.star,
            color: d => d.data3 > 80 ? 'red' : colorScheme[5],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          label: 'Y value of circles',
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          label: 'Y value of Square and Star',
        }
      },
      bucket: {
        range: [400, 600],
        shape: bubbleShapes.circleFill,
        tooltip: 'tooltip-bucket',
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
      dataConfig: [
        {
          accessor: 'group.data1',
          labelFormatter: 'Circle',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'data2',
          labelFormatter: 'Square',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'data3',
          labelFormatter: 'Star',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'group.size1',
          labelFormatter: 'Size of Circle',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'size2',
          labelFormatter: 'Size of Square and Star',
          valueFormatter: formatter.toInteger,
        }
      ]
    }
  }, {
    id: 'tooltip-bucket',
    type: 'Tooltip',
    config: {
      title: {
        accessor: d => 'Points in Bucket: ' + d.length,
      },
    },
  }, {
    id: 'navigation-id',
    type: 'Navigation',
    config: {
      height: 200,
      selection: [50, 100],
      update: ['multishape-bubble-chart'],
      plot: {
        x: {
          accessor: 'group.x',
        },
        y: [
          {
            accessor: 'nav',
            chart: 'Line',
            color: colorScheme[1],
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 6,
        },
      }
    }
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
