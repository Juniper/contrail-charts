
define([
    "contrail-charts"
], function( coCharts ) {
	var data = [
		{ x: 1475760930000, y: 1 },
		{ x: 1475761930000, y: 2 },
		{ x: 1475762930000, y: 3 },
		{ x: 1475763930000, y: 4 },
		{ x: 1475764930000, y: 5 }
	];
	var chartView = new coCharts.ChartView();
	chartView.setData( {}, data );
	chartView.setConfig( {
		mainChart: {
			xAccessor: 'x',
			accessorData: {
				y: {
					chartType: 'line'
				}
			}
		}
	});
	chartView.render();
});
