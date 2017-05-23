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

    it('should render with default color schema', () => {
      config = {
        serie: {
          getValue: v => v.y,
        }
      }
      chart.setConfig(config)
      chart.setData(data)
      let chartSectors = container.querySelectorAll('path.arc')
      let i = 0
      _.forEach(chartSectors, function (sector) {
        let hex = d3.schemeCategory20[i]
        let rgb = hexToRGB(parseInt(hex.slice(1), 16))
        let color = sector.style.fill
        expect(color).toBe(rgb)
        i++
      })
    })

    it('should select sector on hover', () => {
      chart.setData(data)
      let sector = container.querySelectorAll('path.arc')[0]
      let event = new Event('mouseover', {bubbles: true})
      sector.dispatchEvent(event)
      expect(container.querySelectorAll('.highlight')).toBeDefined()
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

    it('should be change radius', () => {
      config.radius = 150
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')
      expect(d).toContain('A150,150')
    })

    it('should be change radius and type', () => {
      config.radius = 150
      config.type = 'pie'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')
      expect(d).toContain('A150,150')
      expect(d).toContain('L0,0Z')
    })
  })

  describe('Render with data variants', () => {
    it('should render empty chart without data', () => {
      chart.render()
      expect(container.querySelector('path.arc')).toBeNull()
    })

    it('should render empty chart with empty data', () => {
      chart.setData([])
      expect(container.querySelector('path.arc')).toBeNull()
    })

    it('should render chart with one sector', () => {
      chart.setData([{ x: 1, y: 2 }])
      expect(container.querySelectorAll('path.arc').length).toBe(1)
    })

    it('should render chart with two sectors', () => {
      chart.setData([
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ])
      expect(container.querySelectorAll('path.arc').length).toEqual(2)
    })

    it('should render chart with two sectors with some color', () => {
      chart.setData([
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ])
      let firstElement = container.querySelectorAll('path.arc')[0]
      let secondElement = container.querySelectorAll('path.arc')[1]
      expect(firstElement.style.fill).toBe(secondElement.style.fill)
    })

    it('should render chart with two some sectors', () => {
      chart.setData([
        { x: 1, y: 2 },
        { x: 1, y: 2 }
      ])
      let firstD = container.querySelectorAll('path.arc')[0].getAttribute('d')
      let secondD = container.querySelectorAll('path.arc')[1].getAttribute('d')
      let firstElementStartPosition = firstD.slice(0, firstD.indexOf('A')).split(',')
      let secondElementStartPosition = secondD.slice(0, secondD.indexOf('A')).split(',')

      expect(firstElementStartPosition[0]).toBe(secondElementStartPosition[0])
      expect(Math.abs(+firstElementStartPosition[1])).toBe(+secondElementStartPosition[1])
    })

    it('should render chart whith NaN data on y', () => {
      data = [
        {x: '1', y: 1},
        {x: '2', y: NaN},
        {x: '3', y: 3}
      ]
      chart.setData(data)
      let sector = container.querySelectorAll('path.arc')[1]
      let d = sector.getAttribute('d')

      expect(d).not.toContain('A')
    })

    it('should render chart whith undefined data on y', () => {
      data = [
        {x: '1', y: 1},
        {x: '2', y: undefined},
        {x: '3', y: 3}
      ]
      chart.setData(data)
      let sector = container.querySelectorAll('path.arc')[1]
      let d = sector.getAttribute('d')

      expect(d).not.toContain('A')
    })

    it('should render chart whith null data on y', () => {
      data = [
        {x: '1', y: 1},
        {x: '2', y: null},
        {x: '3', y: 3}
      ]
      chart.setData(data)
      let sector = container.querySelectorAll('path.arc')[1]
      let d = sector.getAttribute('d')

      expect(d).not.toContain('A')
    })
  })
})