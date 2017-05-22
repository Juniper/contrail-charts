/* global cc, describe, it, expect, beforeEach afterEach */

describe('LineView', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      x: {
        accessor: 'x',
        axis: 'x',
      },
      y: {
        accessor: 'y',
        chart: 'Line',
        axis: 'y',
      },
    }
    data = [
      { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
      { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
      { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
      { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
    ]
    chart = new cc.components.LineView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  it('Line chart should be rendered with svg path', () => {
    chart.setData(data)
    expect(chart.el.querySelector('path.line')).toBeDefined()
  })
})
