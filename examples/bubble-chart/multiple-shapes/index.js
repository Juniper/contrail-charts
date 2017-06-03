/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites, Util} from 'contrail-charts'
import {formatter, _c, fixture} from 'commons'
import './index.scss'

const data = fixture({
  length: 20,
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

const colorScheme = _c.radialColorScheme10
const bubbleShapes = Util.bubbleShapes

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'legend-id',
    type: 'LegendPanel',
    config: {
      editable: {
        color: true,
      },
    },
  }, {
    id: 'multishape-bubble-chart',
    type: 'CompositeY',
    config: {
      legend: 'legend-id',
      bucket: 'bucket-id',
      update: ['navigation-id'],
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
              range: [100, 1000],
            },
            // this is a circle symbol from fontawesome
            shape: bubbleShapes.circleFill,
            color: d => colorScheme[0],
            axis: 'y1',
            tooltip: 'tooltip-id',
          }, {
            accessor: 'data2',
            label: 'Data 2',
            chart: 'ScatterPlot',
            size: {
              accessor: 'size2',
              range: [100, 500],
            },
            color: colorScheme[5],
            shape: bubbleShapes.cloud,
            axis: 'y2',
            tooltip: 'tooltip-id',
          }, {
            accessor: 'data3',
            label: 'Data 3',
            chart: 'ScatterPlot',
            size: {
              accessor: 'size2',
              range: [100, 500],
            },
            shape: bubbleShapes.network,
            color: d => d.data3 > 80 ? colorScheme[9] : colorScheme[8],
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
          label: 'Y value of Cloud and Network',
        }
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
          labelFormatter: 'Cloud',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'data3',
          labelFormatter: 'Network',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'group.size1',
          labelFormatter: 'Size of Circle',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'size2',
          labelFormatter: 'Size of Cloud and Network',
          valueFormatter: formatter.toInteger,
        }
      ]
    }
  }, {
    id: 'bucket-id',
    type: 'Bucket',
    config: {
      range: [500, 800],
      shape: bubbleShapes.bucket,
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
