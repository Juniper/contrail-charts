/* global coCharts, describe, it, expect, spyOn */
// define( ['contrail-charts'], function( coCharts ) {
// var coCharts = require( 'contrail-charts' )

describe('coCharts', function () {
  it('coCharts is defined', function () {
    expect(coCharts).toBeDefined()
  })

  it('coCharts has all elements', function () {
    expect(coCharts.ChartView).toBeDefined()
    expect(coCharts.XYChartView).toBeDefined()
    expect(coCharts.BindingHandler).toBeDefined()
    expect(coCharts.CompositeYChartConfigModel).toBeDefined()
    expect(coCharts.ControlPanelConfigModel).toBeDefined()
    expect(coCharts.MessageConfigModel).toBeDefined()
    expect(coCharts.NavigationConfigModel).toBeDefined()
    expect(coCharts.TooltipConfigModel).toBeDefined()
    expect(coCharts.ContrailChartsDataModel).toBeDefined()
    expect(coCharts.DataProvider).toBeDefined()
    expect(coCharts.CompositeYChartView).toBeDefined()
    expect(coCharts.ControlPanelView).toBeDefined()
    expect(coCharts.MessageView).toBeDefined()
    expect(coCharts.NavigationView).toBeDefined()
    expect(coCharts.TooltipView).toBeDefined()
  })
})

describe('coCharts.XYChartView', function () {
  var simpleChartConfig = {
    mainChart: {
      el: '#chartView',
      xAccessor: 'x',
      accessorData: {
        y: {
          chartType: 'line'
        }
      }
    }
  }

  it('XYChartView has mainChart', function () {
    var chartView = new coCharts.XYChartView()
    chartView.setConfig(simpleChartConfig)
    expect(chartView.compositeYChartView).toBeDefined()
    expect(chartView.navigationView).not.toBeDefined()
  })

  it('XYChartView mainChart generates activeAccessorData on render', function () {
    var chartView = new coCharts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    chartView.compositeYChartView.actualRender()
    expect(chartView.compositeYChartView.params.activeAccessorData.y).toBeDefined()
  })

  it('XYChartView mainChart render is called', function () {
    var chartView = new coCharts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    spyOn(chartView.compositeYChartView, 'render')
    spyOn(chartView.compositeYChartView, 'actualRender')
    chartView.render()
    expect(chartView.compositeYChartView.render).toHaveBeenCalled()
  })
})

// })
