/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global coCharts, describe, it, expect, spyOn */
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
    components: [{
      type: 'xyChart',
      config: {
        el: '#chartView',
        plot: {
          x: {
            accessor: 'x',
            axis: 'x'
          },
          y: [{
            accessor: 'y',
            chart: 'line'
          }]
        }
      }
    }]
  }

  it('XYChartView has xyChart component', function () {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setConfig(simpleChartConfig)
    expect(chartView.getComponentByType('xyChart')).toBeDefined()
    expect(chartView.getComponentByType('navigation')).not.toBeDefined()
  })

  it('XYChartView xy component generates activeAccessorData on render', function (done) {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    var xyChart = chartView.getComponentByType('xyChart')
    xyChart.render()
    // Time for component init before assert
    setTimeout(function () {
      expect(xyChart.params.activeAccessorData[0]).toBeDefined()
      done()
    }, 10)
  })

  it('On XYChartView render, component xy render is called', function () {
    var chartView = new coCharts.charts.XYChartView()
    chartView.setData([])
    chartView.setConfig(simpleChartConfig)
    var xyChart = chartView.getComponentByType('xyChart')
    spyOn(xyChart, 'render')
    chartView.render()
    expect(xyChart.render).toHaveBeenCalled()
  })
})

