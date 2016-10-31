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
var chartConfig = {
  el: "#pieChart",
  chartWidth: 960,
  chartHeight: 500,
  radius: 200,
}
var pieChartView = new coCharts.PieChartView(chartConfig);
pieChartView.setData(pieData);
