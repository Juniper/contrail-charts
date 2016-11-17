/* global coCharts, describe, it, expect, spyOn */
// define( ['contrail-charts'], function( coCharts ) {
// var coCharts = require( 'contrail-charts' )

describe('coCharts', function () {
  it('coCharts is defined', function () {
    expect(coCharts).toBeDefined()
  })

  it('coCharts has all charts, handlers and components', function () {
    expect(coCharts.charts.MultiChartView).toBeDefined()
    expect(coCharts.charts.XYChartView).toBeDefined()
    expect(coCharts.handlers.BindingHandler).toBeDefined()
    expect(coCharts.handlers.DataProvider).toBeDefined()
    expect(coCharts.components.xyChart.ConfigModel).toBeDefined()
    expect(coCharts.components.xyChart.View).toBeDefined()
    expect(coCharts.components.controlPanel.ConfigModel).toBeDefined()
    expect(coCharts.components.controlPanel.View).toBeDefined()
    expect(coCharts.components.message.ConfigModel).toBeDefined()
    expect(coCharts.components.message.View).toBeDefined()
    expect(coCharts.components.navigation.ConfigModel).toBeDefined()
    expect(coCharts.components.navigation.View).toBeDefined()
    expect(coCharts.components.tooltip.ConfigModel).toBeDefined()
    expect(coCharts.components.tooltip.View).toBeDefined()
  })
})

describe('coCharts.charts.XYChartView', function () {
  var simpleChartConfig = {
    xyChart: {
      el: '#chartView',
      plot: {
        x: {
          accessor: 'x',
          axis: 'x'
        },
        y: [{
          accessor: 'y',
          graph: 'line'
        }]
      }
    }
  }

  it('XYChartView has xyChart component', function () {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setConfig(simpleChartConfig)
    expect(chartView._components.xyChart).toBeDefined()
    expect(chartView._components.navigation).not.toBeDefined()
  })

  it('XYChartView xy component generates activeAccessorData on render', function () {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    chartView._components.xyChart._render()
    expect(chartView._components.xyChart.params.activeAccessorData[0]).toBeDefined()
  })

  it('On XYChartView render, component xy render is called', function () {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    spyOn(chartView._components.xyChart, 'render')
    spyOn(chartView._components.xyChart, '_render')
    chartView.render()
    expect(chartView._components.xyChart.render).toHaveBeenCalled()
  })
})

// })
