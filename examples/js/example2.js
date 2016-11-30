/* global coCharts */

function numberFormatFunction (number) {
  return number.toFixed(2)
}

// Complex example
var complexData = []
for (var i = 0; i < 100; i++) {
  var a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10
  })
}
var complexChartView = new coCharts.charts.XYChartView()
complexChartView.setConfig({
  handlers: [{
    type: 'bindingHandler',
    config: {
      bindings: [
        {
          sourceComponent: 'xyChart',
          sourceModel: 'config',
          sourcePath: 'plot',
          targetComponent: 'controlPanel',
          targetModel: 'config',
          action: 'sync'
        }
      ]
    },
  }],
  components: [{
    type: 'xyChart',
    config: {
      el: '#complexChart-xyChart',
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      plot: {
        x: {
          accessor: 'x',
          label: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            label: 'A',
            enabled: true,
            chart: 'stackedBar',
            axis: 'y1',
            tooltip: 'defaultTooltip'
          },
          {
            accessor: 'b',
            label: 'B',
            enabled: true,
            chart: 'stackedBar',
            axis: 'y1',
            tooltip: 'customTooltip'
          },
          {
            accessor: 'c',
            label: 'C',
            enabled: false,
            chart: 'stackedBar',
            axis: 'y1',
            tooltip: 'defaultTooltip'
          },
          {
            accessor: 'd',
            label: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'line',
            axis: 'y2',
            tooltip: 'defaultTooltip'
          },
          {
            accessor: 'e',
            label: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'line',
            axis: 'y2',
            tooltip: 'defaultTooltip'
          }
        ]
      },
      axis: {
        x: {
          formatter: d3.timeFormat('%H:%M:%S'),
        },
        y1: {
          position: 'left',
          formatter: numberFormatFunction,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatFunction,
          labelMargin: 15
        }
      }
    },
  }, {
    type: 'navigation',
    config: {
      el: '#complexChart-navigation',
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 300,
      selection: [1475760930000 + 1000000 * 90, 1475760930000 + 1000000 * 100],
      plot: {
        x: {
          accessor: 'x',
          label: 'Time'
        },
        y: [
          {
            accessor: 'a',
            label: 'A',
            chart: 'stackedBar',
            axis: 'y1'
          },
          {
            accessor: 'b',
            label: 'B',
            chart: 'stackedBar',
            axis: 'y1'
          },
          {
            accessor: 'd',
            label: 'Megabytes',
            chart: 'line',
            axis: 'y2'
          }
        ]
      },
      axis: {
        x: {

        },
        y1: {
          position: 'left',
          formatter: numberFormatFunction,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatFunction,
          labelMargin: 15
        }
      }
    },
  }, {
    id: 'defaultTooltip',
    type: 'tooltip',
    config: {
      dataConfig: [
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
        {
          accessor: 'b',
          labelFormatter: function (key) {
            return 'B'
          },
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'c',
          labelFormatter: function (key) {
            return 'C'
          },
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'd',
          labelFormatter: function (key) {
            return 'D'
          },
          valueFormatter: numberFormatFunction
        },
        {
          accessor: 'e',
          labelFormatter: function (key) {
            return 'E'
          },
          valueFormatter: numberFormatFunction
        }
      ]
    },
  }, {
    id: 'customTooltip',
    type: 'tooltip',
    config: {
      template: function (data) {
        return '<div class="tooltip-content">Custom tooltip</div>'
      }
    }
  }, {
    type: 'controlPanel',
    config: {
      el: '#complexChart-controlPanel',
      enabled: true,
      buttons: [
        {
          name: 'filter',
          title: 'Filter',
          iconClass: 'fa fa-filter',
          events: {
            click: 'filterVariables'
          },
          panel: {
            name: 'accessorData',
            width: '350px'
          }
        },
        {
          name: 'sendMessage',
          title: 'Send Message',
          iconClass: 'fa fa-edit',
          events: {
            click: function () {
              console.log('Send Message clicked.')
              this.eventObject.trigger('message', {
                componentId: 'XYChartView',
                action: 'new',
                messages: [
                  {
                    title: 'New Message',
                    message: 'A message was added.'
                  }
                ]
              })
            }
          }
        },
        {
          name: 'clearMessage',
          title: 'Clear Message',
          iconClass: 'fa fa-eraser',
          events: {
            click: function () {
              console.log('Clear Message clicked.')
              this.eventObject.trigger('clearMessage', 'XYChartView')
            }
          }
        }
      ]
    },
  }, {
    type: 'message',
    config: {
      el: '#messageView',
      enabled: true,
    }
  }, {
    type: 'legend',
    config: {
      el: '#complexChart-legend',
      sourceComponent: 'xyChart'
    },
  }, {
    type: 'crosshair',
    config: {
      el: '#complexChart-xyChart',
      sourceComponent: 'xyChart',
    },
  }]
})
complexChartView.setData(complexData)
complexChartView.render()
complexChartView.renderMessage({
  componentId: 'XYChartView',
  action: 'once',
  messages: [
    {
      level: 'info',
      title: 'Message 1',
      message: 'This is an example message. It will disapear after 5 seconds.'
    },
    {
      level: 'info',
      title: 'Message 2',
      message: 'This is another example message.'
    }
  ]
})

console.log('complexChartView: ', complexChartView)

// Most basic chart.
var simpleData = [
  { x: 1475760930000, y: 0 },
  { x: 1475761930000, y: 3 },
  { x: 1475762930000, y: 2 },
  { x: 1475763930000, y: 4 },
  { x: 1475764930000, y: 5 }
]
var simpleChartView = new coCharts.charts.XYChartView()
simpleChartView.setConfig({
  components: [{
    type: 'xyChart',
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
      }
    }
  }]
})
simpleChartView.setData(simpleData)
