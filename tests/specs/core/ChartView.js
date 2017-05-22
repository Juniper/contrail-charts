/* global cc, describe, it, expect, beforeEach afterEach */

// test ChartView through the public API of LineView
describe('ChartView', () => {
  let config
  let data
  let chart
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      id: 'line-id',
      x: {
        accessor: 'x',
      },
      y: {
        accessor: 'y',
        chart: 'Line',
      },
    }
    data = [
      { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
      { x: (new Date(2016, 11, 2)).getTime(), y: 1 },
      { x: (new Date(2016, 11, 3)).getTime(), y: 2 },
      { x: (new Date(2016, 11, 4)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 5)).getTime(), y: 4 },
    ]
    // Reset the chart container.
    chart = new cc.components.LineView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  it('ChartView has ConfigModel initialized', () => {
    expect(chart.config.constructor.name).toEqual('LineConfigModel')
  })

  it('Component View and ConfigModel types are the same', () => {
    expect(chart.type).toEqual(chart.config.type)
  })

  it('Component View and ConfigModel ids are set', () => {
    expect(chart.id).toEqual(config.id)
    expect(chart.id).toEqual(chart.config.id)
  })

  it('container is set', () => {
    expect(chart.container.node()).toEqual(container)
  })

  it('element is set', () => {
    expect(chart.el).toBeDefined()
    expect(chart.el.id).toEqual(config.id)
    expect(chart.el.parentElement).toBe(null)
  })

  it('svg container is set on render', () => {
    chart.render()
    expect(chart.svg.node()).toBeDefined()
  })

  it('Component element is appended to container on render', () => {
    chart.render()
    expect(container.contains(chart.el)).toBe(true)
  })
})
