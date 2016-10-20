
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
var complexChartView = new coCharts.ChartView();
complexChartView.setData( complexData );
complexChartView.setConfig( {
	bindingHandler: {
        bindings: [
            {
                sourceComponent: 'mainChart',
                sourceModel: 'config',
                sourcePath: 'accessorData',
                targetComponent: 'controlPanel',
                targetModel: 'config',
                action: 'sync'
            }
        ]
    },
	mainChart: {
		el: "#complexChart-mainChart",
		marginInner: 10,
		marginLeft: 80,
		marginRight: 80,
		marginBottom: 40,
		xAccessor: 'x',
		accessorData: {
			a: {
				enable: true,
				chartType: 'stackedBar',
				possibleChartTypes: [ { name: 'stackedBar', label: 'Stacked Bar Chart' }, { name: 'line', label: 'Line Chart' } ],
				y: 1,
				label: "A Label",
				tooltip: {
					nameFormatter: function( key ) {
						return "A";
					},
					valueFormatter: numberFormatFunction
				}
			},
			b: {
				enable: true,
				chartType: 'stackedBar',
				y: 1,
				label: "B Label",
				tooltip: {
					nameFormatter: function( key ) {
						return "B";
					},
					valueFormatter: numberFormatFunction
				}
			},
			c: {
				enable: false,
				chartType: 'stackedBar',
				y: 1,
				label: "C Label"
			},
			d: {
				enable: true,
				chartType: 'line',
				y: 2,
				label: "Megabytes",
				color: "#d62728"
			},
			e: {
				enable: true,
				chartType: 'line',
				y: 2,
				label: "Megabytes",
				color: "#9467bd"
			}
		},
		axis: {
			x: {
				
			},
			y1: {
				formatter: numberFormatFunction,
				labelMargin: 15
			},
			y2: {
				formatter: numberFormatFunction,
				labelMargin: 15
			}
		}
	},
	navigation: {
		el: "#complexChart-navigation",
		marginInner: 10,
		marginLeft: 80,
		marginRight: 80,
		marginBottom: 40,
		xAccessor: 'x',
		accessorData: {
			a: {
				enable: true,
				chartType: 'stackedBar',
				y: 1,
				label: "A Label"
			},
			b: {
				enable: true,
				chartType: 'stackedBar',
				y: 1,
				label: "B Label"
			}				
		}
	},
	tooltip: {

	},
	controlPanel: {
		el: "#complexChart-controlPanel",
        enable: true,
        buttons: [
            {
                name: "filter",
                title: "Filter",
                iconClass: 'fa fa-filter',
                events: {
                    click: "filterVariables"
                },
                panel: {
                    name: "accessorData",
                    width: "350px"
                }
            }
        ]
    },
});
complexChartView.render();



// Most basic chart.
var simpleData = [
	{ x: 1475760930000, y: 0 },
	{ x: 1475761930000, y: 3 },
	{ x: 1475762930000, y: 2 },
	{ x: 1475763930000, y: 4 },
	{ x: 1475764930000, y: 5 }
];
var simpleChartView = new coCharts.ChartView();
simpleChartView.setData( simpleData );
simpleChartView.setConfig( {
	mainChart: {
		el: "#simpleChart",
		xAccessor: 'x',
		accessorData: {
			y: {
				chartType: 'line'
			}
		}
	}
});
simpleChartView.render();
