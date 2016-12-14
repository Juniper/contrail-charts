/* global coCharts */

function numberFormatFunction (number) {
  return number.toFixed(2)
}

var complexData = []
for (var i = 0; i < 100; i++) {
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: (Math.random() - 0.5) * 50,
    y: Math.random() * 100,
    r: Math.random() * 10
  })
}

var chartConfig = {
  components: [{
    type: 'compositeY',
    config: {
      el: '#chart',
      marginInner: 25,
      rRange: [3, 50],
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'a',
            chart: 'scatterBubble',
            sizeAccessor: 'r',
            sizeAxis: 'rAxis',
            shape: 'circle',
          }
        ]
      },
      axis: {
        rAxis: {
          range: [3, 50]
        }
      }
    },
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
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'a',
          labelFormatter: function (key) {
            return 'A'
          },
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'y',
          labelFormatter: function (key) {
            return 'Y'
          },
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'r',
          labelFormatter: function (key) {
            return 'R'
          },
          valueFormatter: numberFormatFunction
        }
      ],
    },
  }, {
    type: 'navigation',
    config: {
      el: '#chart-navigation',
      marginInner: 5,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'a',
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
chartView.render()
