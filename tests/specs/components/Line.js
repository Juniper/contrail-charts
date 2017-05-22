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
      { x: (new Date(2016, 11, 1)).getTime(), y: 0 },
      { x: (new Date(2016, 11, 2)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 3)).getTime(), y: 3 },
      { x: (new Date(2016, 11, 4)).getTime(), y: 4 },
      { x: (new Date(2016, 11, 5)).getTime(), y: 5 },
    ]
    chart = new cc.components.LineView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with default config.', () => {
    it('Line chart render with default config.', () => {
      config = {
        x: {
          accessor: 'x',
        },
        y: {
          accessor: 'y',
        },
      }
      chart.setConfig(config)
      chart.setData(data)
      expect(container.querySelector('path.line')).toBeDefined()
    })
  })

  describe('Render with changed config.', () => {
    it('should apply margin-top and margin-left to view element.', () => {
      config.margin = {left: 20, top: 10}
      chart.setConfig(config)
      chart.setData(data)
      let el = container.querySelector('g.line')

      expect(el.getAttribute('transform')).toBe('translate(20,10)')
    })

    it('should apply margin-bottom and margin-right to view element.', (done) => {
      config.margin = {right: 10, bottom: 5}
      chart.setConfig(config)
      chart.setData(data)
      let svg = container.querySelector('svg')
      let path = container.querySelector('path.line')

      observer('attr', path, 'd', () => {
        let pathRect = path.getBoundingClientRect()
        let svgRect = svg.getBoundingClientRect()

        expect(svgRect.width - pathRect.width).toBe(config.margin.right)
        expect(svgRect.height - pathRect.height).toBe(config.margin.bottom)
        done()
      })
    })

    it('should apply color to line.', (done) => {
      config.y.color = 'red'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelector('path.line')

      observer('attr', path, 'stroke', () => {
        expect(path.getAttribute('stroke')).toBe('rgb(255, 0, 0)')
        done()
      })
    })
  })

  describe('Render with data variants', () => {
    describe('Render with extremum data.', () => {
      it('should not exceed container height.', (done) => {
        data = [
          { x: 1, y: 1 },
          { x: 2, y: 0 },
          { x: 3, y: 2 },
          { x: 4, y: 5 },
          { x: 5, y: 3 },
        ]
        chart.setData(data)
        let path = container.querySelector('path.line')
        let svg = container.querySelector('svg')

        observer('attr', path, 'd', () => {
          let svgRect = svg.getBoundingClientRect()
          let pathRect = path.getBoundingClientRect()

          if (svgRect.height === pathRect.height) {
            expect(svgRect.height).toBe(pathRect.height)
            done()
          }
          expect(svgRect.height).toBeGreaterThan(pathRect.height)
          done()
        })
      })

      it('should not exceed container width.', (done) => {
        data = [
          { x: 1, y: 1 },
          { x: 6, y: 2 },
          { x: 3, y: 3 },
          { x: 0, y: 4 },
          { x: 5, y: 5 },
        ]
        chart.setData(data)
        let path = container.querySelector('path.line')
        let svg = container.querySelector('svg')

        observer('attr', path, 'd', () => {
          let svgRect = svg.getBoundingClientRect()
          let pathRect = path.getBoundingClientRect()

          if (svgRect.width === pathRect.width) {
            expect(svgRect.width).toBe(pathRect.width)
            done()
          }
          expect(svgRect.width).toBeGreaterThan(pathRect.width)
          done()
        })
      })
    })

    it('should render empty chart without data', () => {
      chart.render()
      expect(container.querySelector('path.line')).toBeNull()
    })

    it('should render empty chart with empty data', () => {
      chart.setData([])
      expect(container.querySelector('path.line')).toBeNull()
    })

    it('should render one point', () => {
      chart.setData([{ x: 1, y: 2 }])
      expect(container.querySelector('path.line')).toBeDefined()
    })

    it('should correctly calculate position of two points', (done) => {
      config.width = 300
      config.height = 200
      chart.setConfig(config)
      chart.setData([
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ])
      let path = container.querySelector('path.line')

      observer('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).toBe('M0,200L300,0')
        done()
      })
    })

    it('should render with NaN data on x', () => {
      data = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: NaN, y: 3 },
        { x: 4, y: 4 }
      ]
      chart.setData(data)
      expect(chart.model.data.length).toBe(3)
      expect(container.querySelector('path.line')).toBeDefined()
    })

    it('should render with undefined data on x', () => {
      data = [
        { x: undefined, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 }
      ]
      chart.setData(data)
      expect(chart.model.data.length).toBe(3)
      expect(container.querySelector('path.line')).not.toBeDefined()
    })

    it('should render with NaN data on y', (done) => {
      data = [
        { x: 1, y: 1 },
        { x: 2, y: NaN },
        { x: 3, y: 3 }
      ]
      chart.setData(data)
      let path = container.querySelector('path.line')

      observer('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })

    it('should render with undefined data on y', (done) => {
      data = [
        { x: 1, y: 1 },
        { x: 2, y: undefined },
        { x: 3, y: 3 }
      ]
      chart.setData(data)
      let path = container.querySelector('path.line')

      observer('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })
  })
})