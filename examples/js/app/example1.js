define([
  'd3', 'underscore',
  'contrail-charts'
], function (d3, _, coCharts) {
  console.log('d3: ', d3)

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
  var complexChartView = new coCharts.XYChartView()
  complexChartView.setData(complexData)
  complexChartView.setConfig({
    bindingHandler: {
      bindings: [
        {
          sourceComponent: 'mainChart',
          sourceModel: 'config',
          sourcePath: 'plot',
          targetComponent: 'controlPanel',
          targetModel: 'config',
          action: 'sync'
        }
      ]
    },
    mainChart: {
      el: '#complexChart-mainChart',
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
            graph: 'stackedBar',
            axis: 'y1',
            tooltip: 'tooltip'
          },
          {
            accessor: 'b',
            label: 'B',
            enabled: true,
            graph: 'stackedBar',
            axis: 'y1',
            tooltip: 'tooltip'
          },
          {
            accessor: 'c',
            label: 'C',
            enabled: false,
            graph: 'stackedBar',
            axis: 'y1',
            tooltip: 'tooltip'
          },
          {
            accessor: 'd',
            label: 'Megabytes',
            color: '#d62728',
            enabled: true,
            graph: 'line',
            axis: 'y2',
            tooltip: 'tooltip'
          },
          {
            accessor: 'e',
            label: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            graph: 'line',
            axis: 'y2',
            tooltip: 'tooltip'
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
    navigation: {
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
            graph: 'stackedBar'
          },
          {
            accessor: 'b',
            label: 'B',
            graph: 'stackedBar'
          }
        ]
      }
    },
    tooltip: {
      tooltip: {
        data: [
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
    },
    controlPanel: {
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
  var simpleChartView = new coCharts.XYChartView()
  simpleChartView.setData(simpleData)
  simpleChartView.setConfig({
    mainChart: {
      el: '#simpleChart',
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'y',
            graph: 'line'
          }
        ]
      }
    }
  })
  simpleChartView.render()
})
