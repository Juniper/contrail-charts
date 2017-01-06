/* global coCharts d3 */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value) // eslint-disable-line no-undef
}
function numberFormatter (number) {
  return number.toFixed(2)
}

var complexData = []
for (var i = 0; i < 100; i++) {
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    c: (Math.random() - 0.5) * 50,
    s: Math.random() * 100,
    t: Math.random() * 100,
    r: Math.random() * 10,
    nav: (Math.random() - 0.5) * 50
  })
}

var chartConfig = {
  container: '#chart',
  components: [{
    type: 'compositeY',
    config: {
      chartHeight: 600,
      marginInner: 25,
      rRange: [3, 50],
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'c',
            chart: 'scatterBubble',
            sizeAccessor: 'r',
            sizeAxis: 'rAxis',
            shape: 'circle',
            axis: 'y1'
          },
          {
            accessor: 's',
            chart: 'scatterBubble',
            sizeAccessor: 's',
            sizeAxis: 'rAxis',
            shape: 'square',
            axis: 'y2'
          },
          {
            accessor: 't',
            chart: 'scatterBubble',
            sizeAccessor: 's',
            sizeAxis: 'rAxis',
            shape: 'triangle',
            axis: 'y2'
          }
        ]
      },
      axis: {
        rAxis: {
          range: [3, 50]
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          labelMargin: 15
        }
      },
      // Sample shape function for shape other than circle, square and triangle
      // shapeEnterFunctions: {
      //   // New custom shape
      //   diamond: function (d, selection) {
      //     //create and return diamond shape.
      //   }
      // },
      // shapeEditFunctions: {
      //   // Override the way diamond shape is drawn
      //   diamond: function (d, selection) {
      //   // Add any transition or update on shape.
      //   }
      // }
    }
  }, {
    type: 'tooltip',
    config: {
      title: 'BUBBLE',
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: function (key) {
            return 'Time'
          },
          valueFormatter: timeFormatter
        },
        {
          accessor: 'c',
          labelFormatter: function (key) {
            return 'C'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 's',
          labelFormatter: function (key) {
            return 'S'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 't',
          labelFormatter: function (key) {
            return 'T'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'r',
          labelFormatter: function (key) {
            return 'R'
          },
          valueFormatter: numberFormatter
        }
      ]
    }
  }, {
    type: 'navigation',
    config: {
      marginInner: 5,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'nav',
            chart: 'line'
          }
        ]
      }
    }
  }]
}

var chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(complexData)
