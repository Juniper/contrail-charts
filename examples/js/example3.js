/* global coCharts */

var complexData = []
for (var i = 0; i < 100; i++) {
  var a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 10
  })
}

var chartConfigs = [
  {
    chartId: 'chart1',
    mainChart: {
      el: '#chart1',
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'a',
            graph: 'bar'
          },
          {
            accessor: 'b',
            graph: 'bar'
          }
        ]
      }
    }
  },
  {
    chartId: 'chart2',
    mainChart: {
      el: '#chart2',
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'c',
            graph: 'line'
          }
        ]
      }
    },
    navigation: {
      el: '#chart2-navigation',
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'c',
            graph: 'line'
          }
        ]
      }
    }
  }
]

var chartView = new coCharts.ChartView()
chartView.setConfig({
  bindingHandler: {
    bindings: [
      {
        sourceChart: 'chart2',
        sourceComponent: 'navigation',
        sourceModel: 'events',
        sourcePath: 'windowChanged',
        targetChart: 'chart1',
        targetComponent: 'mainChart',
        targetModel: 'config',
        action: function (sourceModel, targetModel, xMin, xMax) {
          console.log('bindingHandler: ', xMin, xMax)
          var axis = targetModel.get('axis') || {}
          axis.x = axis.x || {}
          axis.x.domain = [xMin, xMax]
          targetModel.set({ axis: axis }, { silent: true })
          targetModel.trigger('change')
        }
      }
    ]
  },
  charts: chartConfigs
})
chartView.setData(complexData, {}, 'chart1')
chartView.setData(complexData, {}, 'chart2')
chartView.render()
