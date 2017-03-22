/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {formatter} from 'commons'

// Complex example
const dataSrc = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  dataSrc.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10
  })
}

const container = 'timeline-chart'
const layoutMeta = {
  [container]: 'col-md-11'
}

const chartConfig = {
  id: container,
  components: [{
    id: 'timeline-compositey',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      possibleChartTypes: {
        y1: [
          {
            label: 'Stacked Bar',
            chart: 'StackedBar'
          }, {
            label: 'Bar',
            chart: 'BarChart'
          }, {
            label: 'Line',
            chart: 'LineChart'
          }
        ],
        y2: [
          {
            label: 'Stacked Bar',
            chart: 'StackedBar'
          }, {
            label: 'Bar',
            chart: 'BarChart'
          }, {
            label: 'Line',
            chart: 'LineChart'
          }
        ]
      },
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            enabled: true,
            chart: 'stackedBar',
            axis: 'y1',
          },
          {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'stackedBarChart',
            axis: 'y1',
          },
          {
            accessor: 'c',
            labelFormatter: 'Label C',
            enabled: false,
            chart: 'StackedBar',
            axis: 'y1',
          },
          {
            accessor: 'd',
            labelFormatter: 'Megabytes D',
            color: '#d62728',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
          },
          {
            accessor: 'e',
            labelFormatter: 'Megabytes E',
            color: '#9467bd',
            enabled: true,
            chart: 'LineChart',
            axis: 'y2',
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
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          labelMargin: 15
        }
      }
    }
  }, {
    type: 'Timeline',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 200,
      selection: [75, 100],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        }
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        }
      }
    }
  }]
}

const chart = new ChartView()

export default {
  container: container,
  layoutMeta: layoutMeta,
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(dataSrc)
  },
  remove: () => {
    chart.remove()
  }
}
