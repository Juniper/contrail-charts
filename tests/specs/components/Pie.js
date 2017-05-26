/* global cc, describe, it, expect, beforeEach afterEach */

describe('PieView', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      type: 'donut',
      radius: 100,
      serie: {
        getValue: v => v.y,
        getLabel: v => v.x,
        valueFormatter: v => v,
      }
    }
    data = [
      { x: 'System process', y: 4499890 },
      { x: 'Process 1', y: 2704659 },
      { x: 'Process 2', y: 2159981 },
      { x: 'Process 3', y: 3853788 },
    ]
    chart = new cc.components.PieView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  it('Pie chart should be rendered with svg path', () => {
    chart.setData(data)
    expect(chart.el.querySelectorAll('path.arc').length).toEqual(4)
  })
})
