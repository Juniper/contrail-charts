/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {ChartView} from 'coCharts'
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

const chartConfig = {
  id: 'chartBox',
  template,
  components: [{
    id: 'legend-panel-id',
    type: 'LegendPanel',
    config: {
      sourceComponent: 'compositey-chart-id',
      editable: {
        colorSelector: false,
        chartSelector: false
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    id: 'compositey-chart-id',
    type: 'CompositeYChart',
    config: {
      height: 300,
      crosshair: 'crosshair-id',
      possibleChartTypes: {
        y1: ['BarChart', 'LineChart'],
        y2: ['BarChart', 'LineChart']
      },
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            enabled: true,
            chart: 'BarChart',
            color: colorScheme[0],
            axis: 'y',
          }, {
            accessor: 'b',
            enabled: true,
            chart: 'BarChart',
            color: colorScheme[1],
            axis: 'y',
          }
        ]
      },
      axis: {
        x: {
          ticks: 6
        },
        y: {
          ticks: 5
        }
      }
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
      enabled: true,
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
      sourceComponent: 'compositey-chart-id2',
      editable: {
        colorSelector: false,
        chartSelector: false
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    type: 'CompositeYChart',
    id: 'compositey-chart-id2',
    config: {
      height: 300,
      possibleChartTypes: ['BarChart', 'LineChart'],
      plot: {
        x: {
          accessor: 'x',
          axis: 'x',
        },
        y: [
          {
            accessor: 'c',
            enabled: true,
            chart: 'LineChart',
            axis: 'y',
            color: colorScheme[2],
          }
        ]
      },
      axis: {
        y: {
          ticks: 5
        }
      }
    },
  }, {
    id: 'pie-chart-id',
    type: 'PieChart',
    provider: {
      formatter: pieDataParser,
    },
    config: {
      marginLeft: 60,
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
    type: 'LegendUniversal',
    config: {
      sourceComponent: 'pie-chart-id',
    },
  }, {
    id: 'navigation-id',
    type: 'Navigation',
    config: {
      marginLeft: 60,
      marginRight: 60,
      marginBottom: 40,
      height: 250,
      selection: [75, 100],
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
            enabled: true,
            chart: 'LineChart',
            color: colorScheme[4],
            axis: 'y',
          }
        ]
      },
      axis: {
        y: {
          ticks: 6
        }
      },
      updateComponents: ['compositey-chart-id2'],
    }
  }]
}

const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(data)

    // Update pie chart data on Navigation zoom
    const navigation = chart.getComponent('navigation-id')
    const zoom = navigation.actionman.get('Zoom')
    const pieChart = chart.getComponent('pie-chart-id')
    zoom.on('fired', (componentIds, {accessor, range}) => {
      const data = navigation.model.filter(accessor, range)
      pieChart.model.data = data
    })
  },
  remove: () => {
    chart.remove()
  }
}
