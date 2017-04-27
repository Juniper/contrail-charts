/* global coCharts, describe, it, expect, beforeEach */
describe('XYChartView', function () {
  beforeEach(function () {
    this.simpleChartConfig = {
      container: '#chart',
      components: [{
        id: 'compositeY',
        type: 'CompositeY',
        config: {
          plot: {
            x: {
              accessor: 'x',
              axis: 'x',
            },
            y: [{
              accessor: 'y',
              chart: 'Line',
              axis: 'y',
            }]
          },
        }
      }]
    }
    this.data = [
      { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
      { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
      { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
      { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
    ]
    // Reset the chart container.
    this.chartView = new coCharts.charts.XYChartView()
  })

  it('XYChartView has xyChart component', function () {
    this.chartView.setConfig(this.simpleChartConfig)
    expect(this.chartView.getComponent('compositeY')).toBeDefined()
    expect(this.chartView.getComponent('navigation')).not.toBeDefined()
  })

  it('XYChartView xy component generates activeAccessorData on render', function (done) {
    this.chartView.setData([])
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    compositeY.render()
    setTimeout(function () {
      expect(compositeY.params.activeAccessorData[0]).toBeDefined()
      done()
    }, 10)
  })

  it('On XYChartView render, component xy is rendered', function (done) {
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    this.chartView.render()
    compositeY.on('render', function () {
      expect(compositeY.el).toBeDefined()
      done()
    })
  })

  it('On XYChartView data set, component xy is rendered', function (done) {
    this.chartView.setConfig(this.simpleChartConfig)
    const compositeY = this.chartView.getComponent('compositeY')
    this.chartView.setData(this.data)

    compositeY.on('render', function () {
      expect(compositeY.el).toBeDefined()
      done()
    })
  })
})
