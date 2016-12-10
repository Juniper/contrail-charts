// Most basic chart.
var simpleData = [
  { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
  { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
  { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
  { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
  { x: (new Date(2016, 11, 5)).getTime(), y: 5 }
]
var simpleChartView = new coCharts.charts.XYChartView()
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
            chart: 'area',
          }
        ]
      },
      axis: {
        x: {
          domain: [(new Date(2016, 11, 2)).getTime(), (new Date(2016, 11, 4)).getTime()]
        }
      }
    }
  }]
})
simpleChartView.setData(simpleData)
