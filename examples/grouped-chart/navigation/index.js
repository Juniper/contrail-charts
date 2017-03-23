/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {_c, fixture} from 'commons'
import template from './template.html'

const colorScheme = _c.lbColorScheme7

const length = 20
const data = fixture({
  length: 20,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3], repeat: true},
    b: {linear: true, range: [0, length * 5], repeat: true},
    c: {random: true, range: [0, -length * 5]},
    d: {linear: true, range: [0, length * 7]},
  },
})

const chartConfig = {
  id: 'chartBox',
  template,
  components: [{
    id: 'stacked-bar-id',
    type: 'CompositeYChart',
    config: {
      marginLeft: 60,
      marginRight: 60,
      marginBottom: 40,
      height: 350,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            label: 'Label A',
            enabled: true,
            chart: 'StackedBarChart',
            color: colorScheme[1],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            color: colorScheme[3],
            axis: 'y',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          label: 'X',
        },
        y: {
          ticks: 10,
        },
      },
    }
  }, {
    id: 'grouped-bar-id',
    type: 'CompositeYChart',
    config: {
      marginLeft: 60,
      marginRight: 60,
      marginBottom: 40,
      height: 350,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            label: 'Label A',
            enabled: true,
            chart: 'BarChart',
            color: colorScheme[1],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            enabled: true,
            chart: 'BarChart',
            color: colorScheme[3],
            axis: 'y',
          },
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          label: 'X',
        },
        y: {
          ticks: 10,
        },
      },
    },
  }, {
    id: 'area-id',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      height: 300,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'a',
            label: 'Label A',
            chart: 'AreaChart',
            axis: 'y',
            color: colorScheme[2],
          }, {
            enabled: true,
            accessor: 'c',
            label: 'Label C',
            chart: 'AreaChart',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[4],
          },
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          label: 'X',
        },
        y: {
          ticks: 10,
        },
      }
    }
  }, {
    id: 'line-id',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      height: 300,
      plot: {
        x: {
          accessor: 'd',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'a',
            label: 'Label A',
            chart: 'LineChart',
            axis: 'y',
            color: colorScheme[2],
          }, {
            enabled: true,
            accessor: 'c',
            label: 'Label C',
            chart: 'LineChart',
            axis: 'y',
            color: colorScheme[4],
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
          label: 'D',
          ticks: 8,
        },
        y: {
          ticks: 10,
        },
      }
    }
  }, {
    id: 'navigation-id',
    type: 'Navigation',
    config: {
      marginLeft: 60,
      marginRight: 60,
      marginBottom: 40,
      height: 250,
      selection: [60, 100],
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
          label: 'X',
        },
        y: [
          {
            accessor: 'a',
            label: 'Label D',
            enabled: true,
            color: colorScheme[2],
            chart: 'LineChart',
            axis: 'y',
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y: {
          ticks: 5,
        },
      },
    }
  }]
}

const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
