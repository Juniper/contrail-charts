// Most basic chart.
var pieData = [
  { x: "<5", y: 2704659 },
  { x: "5-13", y: 4499890 },
  { x: "14-17", y: 2159981 },
  { x: "18-24", y: 3853788 },
  { x: "25-44", y: 14106543 },
  { x: "45-64", y: 8819342 },
  { x: "≥65", y: 612463 },
];
function numberFormatFunction (number) {
  return number.toFixed(2)
}
var chartConfig = {
  radialChart: {
    el: "#pieChart",
    chartWidth: 960,
    chartHeight: 500,
    radius: 200,
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
var chartView = new coCharts.XYChartView();
chartView.setConfig(chartConfig);
chartView.setData(pieData);
