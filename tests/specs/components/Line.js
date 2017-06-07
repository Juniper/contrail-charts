/* global cc, describe, it, expect, beforeEach afterEach */

describe('LineView.', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      duration: 0,
      height: 200,
      margin: {
        left: 0,
      },
      x: {
        accessor: 'x',
        labelFormatter: 'Value',
        scale: 'scaleLinear',
      },
      y: {
        accessor: 'y',
        labelFormatter: 'Label Group.A',
        color: 'red',
      }
    }
    data = [
      { x: 0, y: 0, b: 5 },
      { x: 1, y: 3, b: 3 },
      { x: 2, y: 3, b: 1 },
      { x: 3, y: 4, b: 2 },
      { x: 4, y: 5, b: 3 },
    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should accept single accessor', () => {
      config = {
        x: {
          accessor: 'x',
        },
        y: {
          accessor: 'y',
        },
      }
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      expect(container.querySelector('path.line')).toBeDefined()
    })
  })

  describe('Render with non-default config.', () => {
    it('should apply top and left margin.', () => {
      config.margin = {left: 20, top: 10}
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      let el = container.querySelector('g.line')

      expect(el.getAttribute('transform')).toBe('translate(20,10)')
    })

    it('should apply bottom and right margin.', (done) => {
      config.margin = {right: 10, bottom: 5}
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      let svg = container.querySelector('svg')
      let path = container.querySelector('path.line')

      observe('attr', path, 'd', () => {
        let pathRect = path.getBoundingClientRect()
        let svgRect = svg.getBoundingClientRect()

        expect(svgRect.width - pathRect.width).toBe(config.margin.right)
        expect(svgRect.height - pathRect.height).toBe(config.margin.bottom)
        done()
      })
    })

    it('should apply color to line.', (done) => {
      config.y.color = 'red'
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.line')

      observe('attr', path, 'stroke', () => {
        expect(path.getAttribute('stroke')).toBe('rgb(255, 0, 0)')
        done()
      })
    })
  })

  describe('Render with data variants', () => {
    describe('Render with extremum data.', () => {
      xit('should not exceed container height.', (done) => {
        data = [
          { x: 1, y: 1 },
          { x: 2, y: 0 },
          { x: 3, y: 2 },
          { x: 4, y: 5 },
          { x: 5, y: 3 },
        ]
        chart = new cc.components.LineView({config, container})
        chart.setData(data)
        let path = container.querySelector('path.line')
        let svg = container.querySelector('svg')

        observe('attr', path, 'd', () => {
          let svgRect = svg.getBoundingClientRect()
          let pathRect = path.getBoundingClientRect()

          expect(svgRect.height).toBeGreaterThanOrEqual(pathRect.height)
          done()
        })
      })

      xit('should not exceed container width.', (done) => {
        data = [
          { x: 1, y: 1 },
          { x: 6, y: 2 },
          { x: 3, y: 3 },
          { x: 0, y: 4 },
          { x: 5, y: 5 },
        ]
        chart = new cc.components.LineView({config, container})
        chart.setData(data)
        let path = container.querySelector('path.line')
        let svg = container.querySelector('svg')

        observe('attr', path, 'd', () => {
          let svgRect = svg.getBoundingClientRect()
          let pathRect = path.getBoundingClientRect()

          expect(svgRect.width).toBeGreaterThanOrEqual(pathRect.width)
          done()
        })
      })
    })

    it('should render empty chart without data', () => {
      chart = new cc.components.LineView({config, container})
      chart.render()
      expect(container.querySelector('path.line')).toBeNull()
    })

    it('should render empty chart with empty data', () => {
      chart = new cc.components.LineView({config, container})
      chart.setData([])
      expect(container.querySelector('path.line')).toBeNull()
    })

    it('should render one point', (done) => {
      config.width = 300
      config.height = 200
      chart = new cc.components.LineView({config, container})
      chart.setData([{ x: 1, y: 2 }])
      let path = container.querySelector('path.line')
      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).toBe(`M${config.width},-${config.height}Z`)
        done()
      })
    })

    it('should correctly calculate position of two points', (done) => {
      config.width = 300
      config.height = 200
      chart = new cc.components.LineView({config, container})
      chart.setData([
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ])
      let path = container.querySelector('path.line')

      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).toBe('M0,200L300,0')
        done()
      })
    })

    xit('should render with NaN data on y', (done) => {
      data = [
        { x: 1, y: 1 },
        { x: 2, y: NaN },
        { x: 3, y: 3 }
      ]
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.line')

      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })

    xit('should render with undefined data on y', (done) => {
      data = [
        { x: 1, y: 1 },
        { x: 2, y: undefined },
        { x: 3, y: 3 }
      ]
      chart = new cc.components.LineView({config, container})
      chart.setData(data)
      let path = container.querySelector('path.line')

      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })
  })

  describe('Change config after render', () => {
    it('should change y accessor y => b', (done) => {
      chart = new cc.components.LineView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.y.accessor = 'b'
        chart.setConfig(config)
        let path = container.querySelector('path.line')
        observe('attr', path, 'd', () => {
          let pathD = path.getAttribute('d')
          let lineStartPoint = getPathStartPoint(pathD)

          // line with data by accessor b must start with 0,0 coordinat
          expect(lineStartPoint).toBe('0,0')
          done()
        })
      }, 0)
    })

    it('should change color red => green', (done) => {
      chart = new cc.components.LineView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.y.color = 'green'
        chart.setConfig(config)
        let path = container.querySelector('path.line')
        observe('attr', path, 'd', () => {
          let color = path.getAttribute('stroke')

          // line with accessor b must start with 0,0 coordinat
          expect(color).toBe('rgb(0, 128, 0)')
          done()
        })
      }, 0)
    })
  })
})