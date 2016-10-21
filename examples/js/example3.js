
function numberFormatFunction( number ) {
	return number.toFixed( 2 );
}

// Complex example
var complexData = [];
for( var i = 0; i < 100; i++ ) {
	var a = Math.random() * 100;
	complexData.push( {
		x: 1475760930000 + 1000000 * i,
		a: a,
		b: a + Math.random() * 10,
		c: Math.random() * 100,
		d: i + (Math.random() - 0.5) * 10,
		e: (Math.random() - 0.5) * 10
	});
};

var chartConfigs = [
	{
		chartId: "chart1",
		mainChart: {
			el: "#chart1",
			xAccessor: 'x',
			accessorData: {
				a: {
					chartType: 'line'
				}
			}
		}
	},
	{
		chartId: "chart2",
		mainChart: {
			el: "#chart2",
			xAccessor: 'x',
			accessorData: {
				b: {
					chartType: 'line'
				}
			}
		}
	}
];

var chartView = new coCharts.ChartView();
chartView.setConfig( {
	bindingHandler: {
        bindings: []
    },
	charts: chartConfigs
});
chartView.setData( complexData, {}, "chart1" );
chartView.setData( complexData, {}, "chart2" );
chartView.render();
