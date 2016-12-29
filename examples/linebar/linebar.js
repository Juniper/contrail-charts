/* global coCharts */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value)
}
function cpuFormatter (number) {
  return number.toFixed(2) + '%'
}
function memFormatter (number) {
  var bytePrefixes = ['B', 'KB', 'MB', 'GB', 'TB']
  var bytes = parseInt(number * 1024)
  var formattedBytes = '-'
  _.each(bytePrefixes, function (prefix, idx) {
    if (bytes < 1024) {
      formattedBytes = bytes.toFixed(2) + ' ' + prefix
      return false
    } else {
      if (idx === bytePrefixes.length - 1) {
        formattedBytes = bytes.toFixed(2) + ' ' + prefix
      } else {
        bytes = bytes / 1024
      }
    }
  })
  return formattedBytes
}

// Time series data.
var tsData = []
for (var i = 0; i < 100; i++) {
  tsData.push({
    'T': 1475760930000 + 1000000 * i,
    'cpu_stats.cpu_one_min_avg': Math.random() * 100, // Value between 0-100
    'cpu_stats.rss': Math.random() * (8 * 1048576 - 1024) + 1024 // Value between 8GB - 1MB
  })
}

// Create chart view.
var cpuMemChartView = new coCharts.charts.XYChartView()
cpuMemChartView.setConfig({
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
    }
  }],
  container: '#cpuMemChart',
  components: [{
    type: 'compositeY',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 600,
      plot: {
        x: {
          accessor: 'T',
          label: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'cpu_stats.cpu_one_min_avg',
            label: 'CPU Utilization (%)',
            enabled: true,
            chart: 'stackedBar',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            color: '#6baed6',
            axis: 'y1',
            tooltip: 'defaultTooltip'
          },
          {
            accessor: 'cpu_stats.rss',
            label: 'Memory Usage',
            enabled: true,
            chart: 'line',
            possibleChartTypes: [
              {
                label: 'Stacked Bar',
                chart: 'stackedBar'
              }, {
                label: 'Line',
                chart: 'line'
              }
            ],
            color: '#2ca02c',
            axis: 'y2',
            tooltip: 'customTooltip'
          }
        ]
      },
      axis: {
        x: {},
        y1: {
          position: 'left',
          formatter: cpuFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: memFormatter,
          labelMargin: 15
        }
      }
    }
  }, {
    type: 'navigation',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      chartHeight: 200,
      selection: [75, 100],
      plot: {
        x: {
          accessor: 'T',
          labelFormatter: 'Time'
        },
        y: [
          {
            accessor: 'cpu_stats.cpu_one_min_avg',
            labelFormatter: 'CPU',
            chart: 'stackedBar',
            color: '#6baed6',
            axis: 'y1'
          },
          {
            accessor: 'cpu_stats.rss',
            labelFormatter: 'Memory',
            chart: 'line',
            color: '#2ca02c',
            axis: 'y2'
          }
        ]
      },
      axis: {
        x: {},
        y1: {
          position: 'left',
          formatter: cpuFormatter,
          labelMargin: 15,
          ticks: 4
        },
        y2: {
          position: 'right',
          formatter: memFormatter,
          labelMargin: 15,
          ticks: 4
        }
      }
    }
  }, {
    id: 'defaultTooltip',
    type: 'tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'T',
          labelFormatter: 'Time',
          valueFormatter: timeFormatter
        },
        {
          accessor: 'cpu_stats.cpu_one_min_avg',
          labelFormatter: 'CPU',
          valueFormatter: cpuFormatter
        },
        {
          accessor: 'cpu_stats.rss',
          labelFormatter: 'Memory',
          valueFormatter: memFormatter
        }
      ]
    }
  }, {
    type: 'controlPanel',
    config: {
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
        }
      ]
    }
  }, {
    type: 'message',
    config: {
      enabled: true
    }
  }, {
    type: 'legend',
    config: {
      sourceComponent: 'compositeY'
    }
  }, {
    type: 'crosshair',
    config: {
      sourceComponent: 'compositeY'
    }
  }, {
    type: 'colorPicker',
    config: {
      sourceComponent: 'compositeY'
    }
  }]
})
cpuMemChartView.setData(tsData)
cpuMemChartView.render()
cpuMemChartView.renderMessage({
  componentId: 'XYChartView',
  action: 'once',
  messages: [
    {
      level: 'info',
      title: '',
      message: 'Loading..'
    }
  ]
})
