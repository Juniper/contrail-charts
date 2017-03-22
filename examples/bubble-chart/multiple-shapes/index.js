/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView, Util} from 'coCharts'
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

const chartConfig = {
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
    type: 'CompositeYChart',
    config: {
      marginLeft: 50,
      marginRight: 50,
      chartHeight: 450,
      plot: {
        x: {
          accessor: 'group.x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'group.data1',
            label: 'Data 1',
            chart: 'ScatterPlot',
            sizeAccessor: 'group.size1',
            sizeAxis: 'sizeAxis',
            // this is a circle symbol from fontawesome
            shape: bubbleShapes.circleFill,
            color: colorScheme[0],
            axis: 'y1',
            tooltip: 'tooltip-id',
          }, {
            enabled: true,
            accessor: 'data2',
            label: 'Data 2',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.square,
            color: colorScheme[4],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }, {
            enabled: true,
            accessor: 'data3',
            label: 'Data 3',
            chart: 'ScatterPlot',
            sizeAccessor: 'size2',
            sizeAxis: 'sizeAxis',
            shape: bubbleShapes.star,
            color: d => d.data3 > 80 ? 'red' : colorScheme[5],
            axis: 'y2',
            tooltip: 'tooltip-id',
          }
        ]
      },
      axis: {
        sizeAxis: {
          range: [1, 500]
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
        range: [300, 500],
        shape: bubbleShapes.circleFill,
        color: '#ff7f0e',
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
      marginInner: 5,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'group.x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'nav',
            chart: 'LineChart',
            color: colorScheme[1],
            axis: 'y',
          }
        ]
      },
      axis: {
        y: {
          ticks: 6
        },
      }
    }
  }]
}

const chartView = new ChartView()

export default {
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(data)
  },
  remove: () => {
    chartView.remove()
  }
}
