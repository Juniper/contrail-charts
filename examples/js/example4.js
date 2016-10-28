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
  mainChart: {
    el: '#chart',
    xAccessor: 'x',
    marginInner: 25,
    rRange: [3, 50],
    accessorData: {
      y: {
        chartType: 'scatterBubble',
        sizeAccessor: 'r',
        shape: 'circle',
        tooltip: {
          nameFormatter: function (key) {
            return 'Y'
          },
          valueFormatter: numberFormatFunction
        }
      }
    }
  },
  tooltip: {

  },
  navigation: {
    el: '#chart-navigation',
    xAccessor: 'x',
    marginInner: 5,
    chartHeight: 200,
    accessorData: {
      a: {
        chartType: 'line'
      }
    }
  }
}

var chartView = new coCharts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(complexData)
chartView.render()
