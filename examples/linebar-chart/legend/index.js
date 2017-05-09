/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {formatter, fixture} from 'commons'

const length = 100
const data = fixture({
  length: length,
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
    type: 'LegendPanel',
    config: {
      sourceComponent: 'compositey-chart-id',
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    type: 'ControlPanel',
    config: {
      menu: [
        { id: 'Refresh' },
      ],
    },
  }, {
    id: 'compositey-chart-id',
    type: 'CompositeY',
    config: {
      margin: {
        left: 60,
        right: 60,
      },
      height: 400,
      crosshair: 'crosshair-id',
      possibleChartTypes: {
        y1: ['GroupedBar', 'StackedBar'],
        y2: ['Line']
      },
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Values',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            disabled: true,
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Label D',
            color: '#d62728',
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Label E',
            color: '#9467bd',
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
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
      }
    },
  }, {
    type: 'Navigation',
    config: {
      height: 200,
      margin: {
        left: 60,
      },
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
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'StackedBar',
          }, {
            accessor: 'd',
            labelFormatter: 'Label D',
            chart: 'Line',
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
      componentId: 'compositey-chart-id',
      action: 'once',
      messages: [{
        level: 'info',
        title: 'Message 1',
        message: 'This is an example message. It will disappear after 5 seconds.'
      }, {
        level: 'error',
        title: 'A Fatal Error',
        message: 'This is an error.'
      }, {
        level: 'warn',
        title: 'A waring message',
        message: 'This is another example message.'
      }]
    })
  },
  remove: () => {
    chart.remove()
  }
}
