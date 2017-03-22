/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

define([ // eslint-disable-line no-undef
  'd3v4', // Example use of multiple d3 versions. chart will use d3v4 instead of older d3.
  'lodash',
  'contrail-charts',
], function (d3, _, coCharts) {
  const data = []
  _.each(d3.range(100), i => {
    const a = _.random(0, 100)
    data.push({
      x: 1475760930000 + 1000000 * i,
      a: a,
      b: a + _.random(0, 10),
      c: _.random(0, 100),
      d: i + _.random(-10, 10),
      e: _.random(-10, 10),
    })
  })

  const template = _.template(
  `<div component="chart-id1"></div>
   <div component="chart-id2"></div>`)

  const chartConfig = {
    id: 'chartBox',
    template,
    components: [{
      id: 'chart-id1',
      type: 'CompositeYChart',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 450,
        plot: {
          x: {
            accessor: 'x',
            label: 'Time',
            axis: 'x',
          },
          y: [
            {
              accessor: 'a',
              label: 'Label A',
              enabled: true,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'b',
              label: 'Label B',
              enabled: true,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'c',
              label: 'Label C',
              enabled: false,
              chart: 'StackedBarChart',
              axis: 'y1',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'd',
              label: 'Megabytes D',
              color: '#d62728',
              enabled: true,
              chart: 'LineChart',
              axis: 'y2',
              tooltip: 'default-tooltip',
            }, {
              accessor: 'e',
              label: 'Megabytes E',
              color: '#9467bd',
              enabled: true,
              chart: 'LineChart',
              axis: 'y2',
              tooltip: 'default-tooltip',
            }
          ]
        },
        axis: {
          y1: {
            position: 'left',
            formatter: (value) => value.toFixed(0),
            labelMargin: 15
          },
          y2: {
            position: 'right',
            formatter: (value) => value.toFixed(2),
            labelMargin: 15
          }
        }
      },
    }, {
      id: 'default-tooltip',
      type: 'Tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'x',
            labelFormatter: (key) => 'Time',
            valueFormatter: (value) => value.toFixed(0)
          }, {
            accessor: 'a',
            labelFormatter: () => 'Label A',
            valueFormatter: (value) => value.toFixed(5)
          }, {
            accessor: 'b',
            labelFormatter: () => 'Label B',
            valueFormatter: (value) => value.toFixed(2)
          }
        ]
      }
    }, {
      id: 'chart-id2',
      type: 'CompositeYChart',
      config: {
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        chartHeight: 200,
        plot: {
          x: {
            accessor: 'x',
            axis: 'x',
          },
          y: [
            {
              enabled: true,
              accessor: 'e',
              chart: 'LineChart',
              axis: 'y',
            }
          ]
        },
        axis: {
          y: {
            ticks: 5
          }
        }
      }
    }]
  }

  const chart = new coCharts.ChartView()

  return {
    render: function () {
      chart.setConfig(chartConfig)
      chart.setData(data)
    },
    remove: () => {
      chart.remove()
    }
  }
})
