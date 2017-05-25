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
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should accept accessor function', () => {
      config = {
        radius: 100,
        serie: {
          getValue: v => v.y,
          getLabel: v => v.x
        }
      }
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      expect(container.querySelectorAll('path.arc').length).toEqual(4)
    })

    it('should apply default colors', () => {
      config = {
        radius: 100,
        serie: {
          getValue: v => v.y,
          getLabel: v => v.x
        }
      }
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      let chartSectors = container.querySelectorAll('path.arc')
      _.each(chartSectors, (sector, i) => {
        let hex = d3.schemeCategory20[i]
        let rgb = hexToRGB(parseInt(hex.slice(1), 16))
        let color = sector.style.fill

        expect(color).toBe(rgb)
      })
    })

    it('should select sector on hover', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      let sector = container.querySelectorAll('path.arc')[0]
      let event = new Event('mouseover', {bubbles: true})
      sector.dispatchEvent(event)

      expect(container.querySelectorAll('.highlight')).toBeDefined()
    })
  })

  describe('Render with non-default config.', () => {
    it('should apply changed pie type', () => {
      config.type = 'pie'
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')

      // verify pie sector contains pie center point as the last one
      expect(d).toContain('L0,0Z')
    })

    it('should apply changed radius', () => {
      config.radius = 150
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')

      // verify pie sector contains point on the updated radius distance from the center
      expect(d).toContain('A150,150')
    })

    it('should apply changed radius and type', () => {
      config.radius = 150
      config.type = 'pie'
      chart = new cc.components.PieView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.arc')
      let d = path.getAttribute('d')

      expect(d).toContain('A150,150')
      expect(d).toContain('L0,0Z')
    })
  })

  describe('Render with data variants', () => {
    it('no arcs should be rendered with no data provided', () => {
      chart = new cc.components.PieView({config, container})
      chart.render()

      expect(container.querySelector('path.arc')).toBeNull()
    })

    it('no arcs should be rendered on empty data provided', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData([])

      expect(container.querySelector('path.arc')).toBeNull()
    })

    it('should render chart as a sole circle', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData([{ x: 1, y: 2 }])

      expect(container.querySelectorAll('path.arc').length).toBe(1)
    })

    it('number of arcs should correspond to number of data series', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData([
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ])

      expect(container.querySelectorAll('path.arc').length).toEqual(2)
    })

    it('sectors with the same label should feature same color', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData([
        { x: 1, y: 2 },
        { x: 1, y: 3 }
      ])
      let firstSector = container.querySelectorAll('path.arc')[0]
      let secondSector = container.querySelectorAll('path.arc')[1]

      expect(firstSector.style.fill).toBe(secondSector.style.fill)
    })

    it('verify if sectors are positioned correctly', () => {
      chart = new cc.components.PieView({config, container})
      chart.setData([
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ])
      let firstD = container.querySelectorAll('path.arc')[0].getAttribute('d')
      let secondD = container.querySelectorAll('path.arc')[1].getAttribute('d')
      let firstSectorStartPoint = getPathStartPoint(firstD, 'A').split(',')
      let secondSectorStartPoint = getPathStartPoint(secondD, 'A').split(',')

      expect(firstSectorStartPoint[0]).toBe(secondSectorStartPoint[0])
      expect(Math.abs(+firstSectorStartPoint[1])).toBe(+secondSectorStartPoint[1])
    })

    it('should ignore data with "NaN" y value', () => {
      chart = new cc.components.PieView({config, container})
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

    it('should ignore data with "undefined" y value', () => {
      chart = new cc.components.PieView({config, container})
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

    it('should ignore data with "null" y value', () => {
      chart = new cc.components.PieView({config, container})
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

  describe('Change config after render', () => {
    it('should chang pie type donut => pie', (done) => {
      chart = new cc.components.PieView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.type = 'pie'
        chart.setConfig(config)
        let path = container.querySelectorAll('path.arc')[0]
        let d = path.getAttribute('d')

        // verify pie sector contains pie center point as the last one
        expect(d).toContain('L0,0Z')
        done()
      }, 0)
    })

    it('should chang color scheme schemeCategory20 => schemeCategory20b', (done) => {
      chart = new cc.components.PieView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.colorScheme = d3.schemeCategory20b
        config.duration = 0
        chart.setConfig(config)
        let chartSectors = container.querySelectorAll('path.arc')
        let sector = container.querySelectorAll('path.arc')[3]

        observer('attr', sector, 'style', () => {
          _.each(chartSectors, (sector, i) => {
            let hex = d3.schemeCategory20b[i]
            let rgb = hexToRGB(parseInt(hex.slice(1), 16))
            let color = sector.style.fill

            expect(color).toBe(rgb)
          })
          done()
        })
      }, 0)
    })

    it('should chang radius 100 => 150', (done) => {
      chart = new cc.components.PieView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.radius = 150
        config.duration = 0
        chart.setConfig(config)
        let sector = container.querySelectorAll('path.arc')[0]
        let d = sector.getAttribute('d')

        // verify pie sector contains point on the updated radius distance from the center
        expect(d).toContain('A150,150')
        done()
      }, 0)
    })
  })
})