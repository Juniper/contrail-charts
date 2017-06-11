/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {_c, fixture} from 'commons'
import template from './template.html'

const colorScheme = _c.paletteSoft

const length = 20
const data = fixture({
  length,
  data: {
    x: {linear: true, range: [0, length]},
    a: {random: true, range: [0, length * 5], repeat: true},
    b: {linear: true, range: [0, length * 3], repeat: true},
    c: {random: true, range: [0, -length * 3]},
    d: {linear: true, range: [0, length * 5]},
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
            color: colorScheme[0],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            chart: 'StackedBar',
            color: colorScheme[2],
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
            color: colorScheme[12],
            axis: 'y',
          }, {
            accessor: 'b',
            label: 'Label B',
            chart: 'GroupedBar',
            color: colorScheme[14],
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
            color: colorScheme[3],
          }, {
            accessor: 'c',
            label: 'Label C',
            chart: 'Area',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[9],
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
            color: colorScheme[4],
          }, {
            accessor: 'c',
            label: 'Label C',
            chart: 'Line',
            axis: 'y',
            color: colorScheme[6],
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
      height: 250,
      selection: [60, 100],
      update: ['area-id', 'stacked-bar-id', 'grouped-bar-id'],
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
            color: colorScheme[0],
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
