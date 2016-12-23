/* global coCharts */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function numberFormatter (number) {
  return number.toFixed(2)
}
function numberFormatter3 (number) {
  return number.toFixed(3)
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
          sourceComponent: 'compositeY',
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
    type: 'compositeY',
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
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'A',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            //tooltip: 'defaultTooltip',
          },
          {
            accessor: 'b',
            labelFormatter: 'B',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            //tooltip: 'customTooltip',
          },
          {
            accessor: 'c',
            labelFormatter: 'C',
            enabled: false,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y1',
            //tooltip: 'defaultTooltip',
          },
          {
            accessor: 'd',
            labelFormatter: 'Megabytes',
            color: '#d62728',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y2',
            //tooltip: 'defaultTooltip',
          },
          {
            accessor: 'e',
            labelFormatter: 'Megabytes',
            color: '#9467bd',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Bar',
                chart: 'bar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            axis: 'y2',
            //tooltip: 'defaultTooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: d3.timeFormat('%H:%M:%S')
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
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
      chartHeight: 200,
      selection: [75, 100],
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'A',
            chart: 'stackedBar',
            axis: 'y1'
          },
          {
            accessor: 'b',
            labelFormatter: 'B',
            chart: 'stackedBar',
            axis: 'y1'
          },
          {
            accessor: 'd',
            labelFormatter: 'Megabytes',
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
          formatter: numberFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatter3,
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
          labelFormatter: 'Time',
          valueFormatter: timeFormatter,
        },
        {
          accessor: 'a',
          labelFormatter: 'A',
          valueFormatter: numberFormatter,
        },
        {
          accessor: 'b',
          labelFormatter: 'B',
          valueFormatter: numberFormatter,
        },
        {
          accessor: 'c',
          labelFormatter: 'C',
          valueFormatter: numberFormatter,
        },
        {
          accessor: 'd',
          labelFormatter: 'D',
          valueFormatter: numberFormatter,
        },
        {
          accessor: 'e',
          labelFormatter: 'E',
          valueFormatter: numberFormatter,
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
              this.eventObject.trigger('clearMessage', 'XYChartView')
            }
          }
        },
        {
          name: 'refresh',
          title: 'Refresh',
          iconClass: 'fa fa-refresh',
          events: {
            click: function () {
              this.eventObject.trigger('refresh')
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
      sourceComponent: 'compositeY'
    }
  }, {
    type: 'crosshair',
    config: {
      el: '#complexChart-xyChart',
      sourceComponent: 'compositeY',
      tooltip: 'defaultTooltip'
    }
  }, {
    type: 'colorPicker',
    config: {
      el: '#complexChart-color-picker',
      sourceComponent: 'compositeY'
    }
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
