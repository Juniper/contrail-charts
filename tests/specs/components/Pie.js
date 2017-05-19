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
      { x: 'System process', y: 1 },
      { x: 'Process 1', y: 5 },
      { x: 'Process 2', y: 3 },
      { x: 'Process 3', y: 10 },
    ]
    chart = new cc.components.PieView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with default config.', () => {
    it('Pie chart render with default config.', () => {
      config = {
        serie: {
          getValue: v => v.y,
        }
      }
      chart.setConfig(config)
      chart.setData(data)
      expect(container.querySelectorAll('path.arc').length).toEqual(4)
    })
  })

  describe('Render with changed config.', () => {
    it('should be change pie type', () => {
      config.type = 'pie'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')
      expect(d).toContain('L0,0Z')
    })
  })
})