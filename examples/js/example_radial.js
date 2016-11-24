// Most basic chart.
var pieData = [
  { x: "System process", y: 4499890 },
  { x: "Process 1", y: 2704659 },
  { x: "Process 2", y: 2159981 },
  { x: "Process 3", y: 3853788 },
  { x: "Process 4", y: 14106543 },
  { x: "Process 5", y: 8819342 },
  { x: "Process 6", y: 612463 },
];
function numberFormatFunction (number) {
  return number.toFixed(2)
}
var chartConfig = {
  radialChart: {
    el: ".pie-chart",
    chartWidth: 480,
    chartHeight: 360,
    radius: 100,
  },
  tooltip: {
    tooltip: {
      data: [
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
      ],
    },
  },
}
var chartView = new coCharts.charts.RadialChartView()
chartView.setConfig(chartConfig)
chartView.setData(pieData)
