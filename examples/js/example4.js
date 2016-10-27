
var complexData = [];
for( var i = 0; i < 100; i++ ) {
	complexData.push( {
		x: 1475760930000 + 1000000 * i,
		y: Math.random() * 100,
		r: Math.random() * 10
	});
};

var chartConfig = {
	mainChart: {
		el: "#chart",
		xAccessor: 'x',
		marginInner: 10,
        rRange: [2, 10],
		accessorData: {
			y: {
				chartType: 'scatterBubble',
				sizeAccessor: 'r',
				shape: 'circle'
			}
		}
	}
};

var chartView = new coCharts.XYChartView();
chartView.setConfig( chartConfig );
chartView.setData( complexData );
chartView.render();
