/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'd3', // Example use of older d3 versions.
  'underscore',
  'contrail-charts'
], function (d3, _, coCharts) {
  // Complex example
  var complexData = []
  _.each(d3.range(100), function (i) {
    var a = Math.random() * 100
    complexData.push({
      x: 1475760930000 + 1000000 * i,
      a: a,
      b: a + Math.random() * 10,
      c: Math.random() * 100,
      d: i + (Math.random() - 0.5) * 10,
      e: (Math.random() - 0.5) * 10
    })
  })
  var complexChartView = new coCharts.charts.XYChartView()
  complexChartView.setData(complexData)
  complexChartView.setConfig({
    handlers: [{
      type: 'bindingHandler',
      config: {
        bindings: [
          {
            sourceComponent: 'compositeY',
            sourceModel: 'config',
            sourcePath: 'plot',
            targetComponent: 'controlPanel',
            targetModel: 'config',
            action: 'sync'
          }
        ]
      }
    }],
    components: [{
      type: 'compositeY',
      config: {
        el: '#complexChart-xyChart',
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        plot: {
          x: {
            accessor: 'x',
            label: 'Time',
            axis: 'x'
          },
          y: [
            {
              accessor: 'a',
              label: 'A',
              enabled: true,
              chart: 'stackedBar',
              axis: 'y1',
            },
            {
              accessor: 'b',
              label: 'B',
              enabled: true,
              chart: 'stackedBar',
              axis: 'y1',
            },
            {
              accessor: 'c',
              label: 'C',
              enabled: false,
              chart: 'stackedBar',
              axis: 'y1',
            },
            {
              accessor: 'd',
              label: 'Megabytes',
              color: '#d62728',
              enabled: true,
              chart: 'line',
              axis: 'y2',
            },
            {
              accessor: 'e',
              label: 'Megabytes',
              color: '#9467bd',
              enabled: true,
              chart: 'line',
              axis: 'y2',
            }
          ]
        },
        axis: {
          x: {

          },
          y1: {
            position: 'left',
            formatter: d3.format('.0f'),
            labelMargin: 15
          },
          y2: {
            position: 'right',
            formatter: d3.format('.02f'),
            labelMargin: 15
          }
        }
      },
    }, {
      type: 'navigation',
      config: {
        el: '#complexChart-navigation',
        marginInner: 10,
        marginLeft: 80,
        marginRight: 80,
        marginBottom: 40,
        plot: {
          x: {
            accessor: 'x',
            label: 'Time'
          },
          y: [
            {
              accessor: 'a',
              label: 'A',
              chart: 'stackedBar'
            },
            {
              accessor: 'b',
              label: 'B',
              chart: 'stackedBar'
            }
          ]
        }
      },
    }, {
      type: 'tooltip',
      config: {
        dataConfig: [
          {
            accessor: 'x',
            labelFormatter: function (key) {
              return 'Time'
            },
            valueFormatter: d3.format('.0f')
          },
          {
            accessor: 'a',
            labelFormatter: function (key) {
              return 'A'
            },
            valueFormatter: d3.format('.05f')
          },
          {
            accessor: 'b',
            labelFormatter: function (key) {
              return 'B'
            },
            valueFormatter: d3.format('.02f')
          }
        ]
      }
    }, {
      type: 'controlPanel',
      config: {
        el: '#complexChart-controlPanel',
        enabled: true,
        buttons: [
          {
            name: 'filter',
            title: 'Filter',
            iconClass: 'fa fa-filter',
            events: {
              click: 'filterVariables'
            },
            panel: {
              name: 'accessorData',
              width: '350px'
            }
          }
        ]
      }
    }]
  })
  complexChartView.render()

  // Most basic chart.
  var simpleData = [
    { x: 1475760930000, y: 0 },
    { x: 1475761930000, y: 3 },
    { x: 1475762930000, y: 2 },
    { x: 1475763930000, y: 4 },
    { x: 1475764930000, y: 5 }
  ]
  var simpleChartView = new coCharts.charts.XYChartView()
  simpleChartView.setData(simpleData)
  simpleChartView.setConfig({
    components: [{
      type: 'compositeY',
      config: {
        el: '#simpleChart',
        plot: {
          x: {
            accessor: 'x'
          },
          y: [
            {
              accessor: 'y',
              chart: 'line'
            }
          ]
        }
      }
    }]
  })
  simpleChartView.render()
})
