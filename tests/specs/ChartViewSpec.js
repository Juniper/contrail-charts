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
    expect(coCharts.components.compositeY.ConfigModel).toBeDefined()
    expect(coCharts.components.compositeY.View).toBeDefined()
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
  beforeEach(function () {
    this.simpleChartConfig = {
      components: [{
        type: 'compositeY',
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
    this.chartView = new coCharts.charts.XYChartView()
    this.chartView.setConfig(this.simpleChartConfig)
  })

  it('XYChartView has xyChart component', function () {
    this.chartView.setConfig(this.simpleChartConfig)
    expect(this.chartView.getComponentByType('compositeY')).toBeDefined()
    expect(this.chartView.getComponentByType('navigation')).not.toBeDefined()
  })

  it('XYChartView xy component generates activeAccessorData on render', function (done) {
    this.chartView.setData([])
    this.chartView.setConfig(this.simpleChartConfig)
    var compositeY = this.chartView.getComponentByType('compositeY')
    compositeY.render()
    // Time for component init before assert
    setTimeout(function () {
      expect(compositeY.params.activeAccessorData[0]).toBeDefined()
      done()
    }, 10)
  })

  it('On XYChartView render, component xy render is called', function () {
    this.chartView.setData([])
    this.chartView.setConfig(this.simpleChartConfig)
    var compositeY = this.chartView.getComponentByType('compositeY')
    spyOn(compositeY, 'render')
    this.chartView.render()
    expect(compositeY.render).toHaveBeenCalled()
  })
})

