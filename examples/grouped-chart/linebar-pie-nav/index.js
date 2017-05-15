/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'contrail-charts'
import {formatter, _c, fixture} from 'commons'
import template from './template.html'
const colorScheme = _c.d3ColorScheme20

const now = _.now()
const length = 100
const data = fixture({
  length: length,
  data: {
    x: {linear: true, range: [now - 30000000, now]},
    a: {random: true, range: [2, (length - 1) * 2]},
    b: {random: true, range: [3, (length - 1) * 3]},
    c: {random: true, range: [7, (length - 1) * 7]},
    d: {random: true, range: [9, (length - 1) * 9]},
  },
})

function pieDataParser (tsData) {
  const tsSumData = _.reduce(tsData, (v1, v2) => {
    return {
      a: v1.a + v2.a,
      b: v1.b + v2.b,
      c: v1.c + v2.c,
    }
  })
  return _.map(tsSumData, (v, k) => {
    return {
      label: k,
      value: v,
    }
  })
}

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'legend-panel-id',
    type: 'LegendPanel',
    config: {
    },
  }, {
    id: 'compositey-chart-id',
    type: 'CompositeY',
    config: {
      legend: 'legend-panel-id',
      crosshair: 'crosshair-id',
      height: 300,
      chartTypes: {
        y1: ['GroupedBar', 'Line'],
        y2: ['GroupedBar', 'Line']
      },
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            chart: 'GroupedBar',
            color: colorScheme[0],
            axis: 'y',
          }, {
            accessor: 'b',
            chart: 'GroupedBar',
            color: colorScheme[1],
            axis: 'y',
          }
        ]
      },
      axes: {
        x: {
          ticks: 6,
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 5,
        }
      },
    }
  }, {
    id: 'crosshair-id',
    config: {
      container: 'compositey-chart-id',
      tooltip: 'tooltip-id',
    },
    type: 'Crosshair',
  }, {
    id: 'message-id',
    type: 'Message',
    config: {
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'x',
        valueFormatter: formatter.extendedISOTime,
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
        }
      ]
    },
  }, {
    id: 'legend-panel-id2',
    type: 'LegendPanel',
    config: {
    },
  }, {
    type: 'CompositeY',
    id: 'compositey-chart-id2',
    config: {
      legend: 'legend-panel-id2',
      height: 300,
      chartTypes: ['GroupedBar', 'Line'],
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'c',
            chart: 'Line',
            axis: 'y',
            color: colorScheme[2],
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime,
          ticks: 4,
        },
        y: {
          ticks: 5,
        }
      },
    },
  }, {
    id: 'pie-chart-id',
    type: 'Pie',
    model: {
      formatter: pieDataParser,
    },
    config: {
      legend: 'legend-pie',
      margin: {
        left: 60,
      },
      type: 'donut',
      radius: 100,
      width: 200,
      height: 300,
      colorScale: d3.scaleOrdinal().range([colorScheme[0], colorScheme[4], colorScheme[2]]), // eslint-disable-line no-undef
      serie: {
        getValue: serie => serie.value,
        getLabel: serie => serie.label,
        valueFormatter: formatter.commaGroupedInteger,
      },
      tooltip: 'tooltip-id2',
      action: {
        'click node': data => {
          chart.renderMessage({
            action: 'once',
            messages: [{
              level: 'info',
              title: 'Pie chart message',
              message: `Sum of selected "${data.label}" values: ${data.value}`,
            }]
          })
        },
      },
    },
  }, {
    id: 'tooltip-id2',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: serie => serie.label,
          valueFormatter: formatter.commaGroupedInteger,
        },
      ],
    },
  }, {
    id: 'legend-pie',
    type: 'Legend',
    config: {
    },
  }, {
    id: 'navigation-id',
    type: 'Navigation',
    config: {
      height: 250,
      selection: [75, 100],
      update: ['compositey-chart-id2'],
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
          label: 'Time'
        },
        y: [
          {
            accessor: 'd',
            label: 'Label D',
            chart: 'Line',
            color: colorScheme[4],
            axis: 'y',
          }
        ]
      },
      axes: {
        x: {
          ticks: 8,
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 6,
        }
      },
    }
  }]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)

    // Update pie chart data on Navigation zoom
    const navigation = chart.composite.get('navigation-id')
    const zoom = navigation.actionman.get('Zoom')
    const pie = chart.composite.get('pie-chart-id')
    zoom.on('fired', (componentIds, ranges) => {
      const data = navigation.model.filter('x', ranges['x'])
      pie.model.data = data
    })
  },
  remove: () => {
    chart.remove()
  }
}
