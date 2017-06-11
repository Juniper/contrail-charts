/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {formatter, _c, fixture} from 'commons'
const colorScheme = _c.palette

const length = 100
const data = fixture({
  length,
  data: {
    x: {linear: true, range: [0, length]},
    a: {random: true, range: [3, (length - 1) * 3]},
    b: {random: true, range: [5, (length - 1) * 5], repeat: true},
    c: {random: true, range: [7, (length - 1) * 7]},
    d: {linear: true, range: [7, (length - 1) * 7]},
    e: {random: true, range: [2, (length - 1) * 2]},
  },
})

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'legend-id',
    type: 'LegendPanel',
    config: {
      editable: {
        color: true,
        chart: true,
      },
    },
  }, {
    id: 'compositey-chart-id',
    type: 'CompositeY',
    config: {
      legend: 'legend-id',
      crosshair: 'crosshair-id',
      margin: {
        left: 16,
        right: 20,
      },
      height: 400,
      chartTypes: {
        y1: ['GroupedBar', 'StackedBar'],
        y2: ['Line'],
      },
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Values',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
            color: colorScheme[0],
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
            color: colorScheme[1],
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            disabled: true,
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
            color: colorScheme[2],
          }, {
            accessor: 'd',
            labelFormatter: 'Label D',
            color: colorScheme[6],
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Label E',
            color: colorScheme[4],
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
          label: 'X',
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          domain: [-10, undefined],
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
        }
      },
    },
  }, {
    type: 'Navigation',
    config: {
      margin: {
        left: 16,
      },
      height: 200,
      selection: [75, 100],
      update: ['compositey-chart-id'],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Values',
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'StackedBar',
            color: colorScheme[0],
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'StackedBar',
            color: colorScheme[1],
          }, {
            accessor: 'd',
            labelFormatter: 'Label D',
            chart: 'Line',
            color: colorScheme[6],
          }
        ]
      },
      axis: {
        x: {
          scale: 'scaleLinear',
        },
        y: {
          formatter: formatter.toInteger,
          ticks: 5,
        },
      }
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
      },
      dataConfig: [
        {
          accessor: 'a',
          labelFormatter: 'Label A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Label B',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Label C',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'd',
          labelFormatter: 'Label D',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'e',
          labelFormatter: 'Label E',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }, {
    id: 'message-id',
    type: 'Message',
    config: {
    }
  }, {
    id: 'crosshair-id',
    type: 'Crosshair',
    config: {
      tooltip: 'default-tooltip',
    }
  }]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
    chart.actionman.fire('SendMessage', {
      action: 'once',
      messages: [{
        level: 'info',
        title: 'Message 1',
        text: 'This is an example message. It will disappear after 5 seconds.'
      }, {
        level: 'error',
        title: 'A Fatal Error',
        text: 'This is an error.'
      }, {
        level: 'warn',
        title: 'A warning message',
        text: 'This is another example message.'
      }]
    })
  },
  remove: () => {
    chart.remove()
  }
}
