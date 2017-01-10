/* global coCharts */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function numberFormatter (number) {
  return number.toFixed(2)
}
function numberFormatter3 (number) {
  return number.toFixed(3)
}

// Complex example
var complexData = []
for (var i = 0; i < 100; i++) {
  var a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10
  })
}
var complexChartView = new coCharts.charts.XYChartView()
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
    },
  }],
  container: '#complexChart',
  components: [{
    id: 'complexChartCompositeY',
    type: 'compositeY',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'A',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
          },
          {
            accessor: 'b',
            labelFormatter: 'B',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
          },
          {
            accessor: 'c',
            labelFormatter: 'C',
            enabled: false,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
          },
          {
            accessor: 'd',
            labelFormatter: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y2',
          },
          {
            accessor: 'e',
            labelFormatter: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y2',
          }
        ]
      },
      axis: {
        x: {
          formatter: d3.timeFormat('%H:%M:%S')
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
          labelMargin: 15
        }
      }
    }
  }, {
    type: 'timeline',
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
          formatter: d3.timeFormat('%H:%M:%S')
        }
      }
    }
  }]
})
complexChartView.setData(complexData)
complexChartView.render()
