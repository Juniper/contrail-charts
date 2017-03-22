/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {formatter, fixture} from 'commons'
import template from './template.html'

const data = fixture()

const chartConfig = {
  id: 'chartBox',
  template,
  components: [{
    id: 'compositey-id1',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 300,
      plot: {
        x: {
          accessor: 't',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'StackedBarChart',
            axis: 'y1',
            tooltip: 'custom-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Megabytes C',
            color: 'grey',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }, {
    id: 'custom-tooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }, {
    id: 'compositey-id2',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 300,
      plot: {
        x: {
          accessor: 't',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
            tooltip: 'sticky-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'sticky-tooltip',
    type: 'Tooltip',
    config: {
      sourceComponent: 'compositey-id2',
      sticky: true,
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
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
