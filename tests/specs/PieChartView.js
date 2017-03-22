/* global coCharts, describe, it, expect, beforeEach */
describe('PieChartView', function () {
  beforeEach(function () {
    this.chartConfig = {
      id: 'chart',
      components: [{
        id: 'pie-chart-id',
        type: 'PieChart',
        config: {
          type: 'donut',
          radius: 100,
          serie: {
            getValue: v => v.y,
            getLabel: v => v.x,
            valueFormatter: v => v,
          }
        },
      }]
    }
    this.data = [
      { x: 'System process', y: 4499890 },
      { x: 'Process 1', y: 2704659 },
      { x: 'Process 2', y: 2159981 },
      { x: 'Process 3', y: 3853788 },
    ]
    this.chartView = new coCharts.ChartView()
  })

  it('ChartView has pie component', function () {
    this.chartView.setConfig(this.chartConfig)
    expect(this.chartView.getComponent('pie-chart-id')).toBeDefined()
  })
})
