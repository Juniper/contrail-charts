/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'coCharts'
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

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'stacked-bar-id',
    type: 'CompositeY',
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
            chart: 'StackedBar',
            color: colorScheme[1],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            chart: 'StackedBar',
            color: colorScheme[3],
            axis: 'y',
          }
        ]
      },
      axes: {
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
    type: 'CompositeY',
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
            chart: 'GroupedBar',
            color: colorScheme[1],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            chart: 'GroupedBar',
            color: colorScheme[3],
            axis: 'y',
          },
        ]
      },
      axes: {
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
    type: 'CompositeY',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
      height: 300,
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            label: 'Label A',
            chart: 'Area',
            axis: 'y',
            color: colorScheme[2],
          }, {
            accessor: 'c',
            label: 'Label C',
            chart: 'Area',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[4],
          },
        ]
      },
      axes: {
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
    type: 'CompositeY',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
      height: 300,
      plot: {
        x: {
          accessor: 'd',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            label: 'Label A',
            chart: 'Line',
            axis: 'y',
            color: colorScheme[2],
          }, {
            accessor: 'c',
            label: 'Label C',
            chart: 'Line',
            axis: 'y',
            color: colorScheme[4],
          }
        ]
      },
      axes: {
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
            color: colorScheme[2],
            chart: 'Line',
            axis: 'y',
          }
        ]
      },
      axes: {
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

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
