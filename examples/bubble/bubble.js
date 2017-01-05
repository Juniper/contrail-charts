/* global coCharts d3 */

function timeFormatter (value) {
  return d3.timeFormat('%H:%M:%S')(value) // eslint-disable-line no-undef
}
function numberFormatter (number) {
  return number.toFixed(2)
}

var complexData = []
for (var i = 0; i < 100; i++) {
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: (Math.random() - 0.5) * 50,
    y: Math.random() * 100,
    r: Math.random() * 10
  })
}

var chartConfig = {
  components: [{
    type: 'compositeY',
    config: {
      el: '#chart',
      marginInner: 25,
      rRange: [3, 50],
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'a',
            chart: 'scatterBubble',
            sizeAccessor: 'r',
            sizeAxis: 'rAxis',
            shape: 'circle',
            axis: 'y1'
          },
          {
            accessor: 'y',
            chart: 'scatterBubble',
            sizeAccessor: 'r',
            sizeAxis: 'rAxis',
            shape: 'square',
            axis: 'y2'
          }
        ]
      },
      axis: {
        rAxis: {
          range: [3, 50]
        },
        y1: {
          position: 'left',
          formatter: numberFormatter,
          labelMargin: 15
        },
        y2: {
          position: 'right',
          formatter: numberFormatter,
          labelMargin: 15
        }
      },
      shapeEnterFunctions: {
        // Override the way circle shape is drawn
        circle: function (d, selection) {
          return selection.append('circle')
            .attr('class', d.className)
            .attr('cx', d.x)
            .attr('cy', d.y)
            .attr('fill', d.color)
            .attr('r', 0)
        },
        // New custom shape
        square: function (d, selection) {
          return selection.append('rect')
            .attr('class', d.className)
            .attr('x', d.x)
            .attr('y', d.y)
            .attr('fill', d.color)
            .attr('width', 0)
            .attr('height', 0)
        }
      },
      shapeEditFunctions: {
        // Override the way circle shape is drawn
        circle: function (d, selection) {
          selection.transition().ease(d3.easeLinear).duration(300)
            .attr('cx', d.x)
            .attr('cy', d.y)
            .attr('fill', '#ff0000')
            .attr('r', d.r)
        },
        // New custom shape
        square: function (d, selection) {
          selection.transition().ease(d3.easeLinear).duration(300)
            .attr('x', d.x)
            .attr('y', d.y)
            .attr('fill', '#00ff00')
            .attr('width', d.r)
            .attr('height', d.r)
        }
      }
    }
  }, {
    type: 'tooltip',
    config: {
      title: 'BUBBLE',
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: function (key) {
            return 'Time'
          },
          valueFormatter: timeFormatter
        },
        {
          accessor: 'a',
          labelFormatter: function (key) {
            return 'A'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'y',
          labelFormatter: function (key) {
            return 'Y'
          },
          valueFormatter: numberFormatter
        },
        {
          accessor: 'r',
          labelFormatter: function (key) {
            return 'R'
          },
          valueFormatter: numberFormatter
        }
      ]
    }
  }, {
    type: 'navigation',
    config: {
      el: '#chart-navigation',
      marginInner: 5,
      chartHeight: 200,
      plot: {
        x: {
          accessor: 'x'
        },
        y: [
          {
            accessor: 'a',
            chart: 'line'
          }
        ]
      }
    }
  }]
}

var chartView = new coCharts.charts.XYChartView()
chartView.setConfig(chartConfig)
chartView.setData(complexData)
chartView.render()
