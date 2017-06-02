/* global cc, describe, it, expect, beforeEach afterEach */

describe('ScatterPlotView.', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')
  const bubbleShapes = cc.Util.bubbleShapes

  beforeEach(() => {
    config = {
      x: {
        accessor: 'x',
      },
      y: {
        accessor: 'y',
        shape: 'A',
      },
      size: {
        accessor: 'b',
      }
    }
    data = [
      {x: 0, y: 0, b: 5},
      {x: 1, y: 3, b: 3},
      {x: 2, y: 3, b: 1},
      {x: 3, y: 4, b: 2},
      {x: 4, y: 5, b: 3}
    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should render points', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot .point')
      expect(points.length).toBe(5)
    })

    it('should apply points icon', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot .point')
      _.each(points, (point) => {
        let code = point.innerHTML
        expect(code).toBe(config.y.shape)
      })
    })

    it('check the correctness of the size of points', () => {
      let data = [
        {x: 0, y: 0, b: 1},
        {x: 1, y: 1, b: 2},
        {x: 2, y: 2, b: 3}
      ]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot .point')
      let firstPointFontSize = points[0].style.fontSize
      let endPointFontSize = points[points.length - 1].style.fontSize

      // default range [1, 500]
      expect(+firstPointFontSize.slice(0, -2)).toBeCloseTo(Math.sqrt(1))
      expect(+endPointFontSize.slice(0, -2)).toBeCloseTo(Math.sqrt(500))
    })

    it('point should have class "active" on hover', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot .point')
      let lastPoint = points[points.length - 1]
      let event = new Event('mouseover', {bubbles: true})
      lastPoint.dispatchEvent(event)

      expect(lastPoint.classList.contains('active')).toBeTruthy()
    })
  })

  describe('Render with non-default config.', () => {
    it('should apply color to points', () => {
      config.y.color = 'red'
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot .point')
      _.each(points, point => {
        let color = point.getAttribute('fill')
        expect(color).toBe(config.y.color)
      })
    })

    it('should apply domain', () => {
      config.size.domain = [0, 5]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let minSizePoint = container.querySelectorAll('.scatter-plot .point')[2]
      let fontSize = minSizePoint.style.fontSize
      expect(+fontSize.slice(0, -2)).not.toBeCloseTo(Math.sqrt(1))
    })
  })

  describe('Render with data variants', () => {
    describe('Render with extremum data.', () => {
      it('should not exceed container height', () => {
        data = [
          {x: 0, y: 1, b: 2},
          {x: 1, y: 0, b: 5},
          {x: 2, y: 3, b: 1},
          {x: 3, y: 4, b: 5},
          {x: 4, y: 3, b: 3},
        ]
        chart = new cc.components.ScatterPlotView({config, container})
        chart.setData(data)
        let svg = container.querySelector('svg')
        let scatterPlot = container.querySelector('.scatter-plot')
        let svgRect = svg.getBoundingClientRect()
        let scatterPlotRect = scatterPlot.getBoundingClientRect()
        expect(svgRect.height).toBeGreaterThanOrEqual(scatterPlotRect.height)
      })

      it('should not exceed container width', () => {
        data = [
          {x: 1, y: 0, b: 2},
          {x: 0, y: 1, b: 5},
          {x: 2, y: 2, b: 1},
          {x: 4, y: 3, b: 5},
          {x: 3, y: 4, b: 3},
        ]
        chart = new cc.components.ScatterPlotView({config, container})
        chart.setData(data)
        let svg = container.querySelector('svg')
        let scatterPlot = container.querySelector('.scatter-plot')
        let svgRect = svg.getBoundingClientRect()
        let scatterPlotRect = scatterPlot.getBoundingClientRect()

        expect(svgRect.width).toBeGreaterThanOrEqual(scatterPlotRect.width)
      })
    })

    it('should render empty chart without data', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.render()
      expect(container.querySelector('.point')).toBeNull()
    })

    it('should render empty chart with empty data', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData([])
      expect(container.querySelector('.point')).toBeNull()
    })

    it('should render with NaN data on y', () => {
      data = [
        {x: 0, y: 0, b: 5},
        {x: 1, y: NaN, b: 3},
        {x: 2, y: 3, b: 1}
      ]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.point')
      _.each(points, point => {
        let transform = point.getAttribute('transform')
        expect(transform).not.toContain('NaN')
      })
    })

    it('should render with undefined data on y', () => {
      data = [
        {x: 0, y: 0, b: 5},
        {x: 1, y: undefined, b: 3},
        {x: 2, y: 3, b: 1}
      ]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.point')
      _.each(points, point => {
        let transform = point.getAttribute('transform')
        expect(transform).not.toContain('NaN')
      })
    })

    it('should render with null data on y', () => {
      data = [
        {x: 0, y: 0, b: 5},
        {x: 1, y: null, b: 3},
        {x: 2, y: 3, b: 1}
      ]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.point')
      _.each(points, point => {
        let transform = point.getAttribute('transform')
        expect(transform).not.toContain('NaN')
      })
    })
  })

  describe('Change config after render', () => {
    it('should changed points icon', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      config.y.shape = bubbleShapes.star
      chart.setConfig(config)
      let points = container.querySelectorAll('.scatter-plot .point')
      _.each(points, (point) => {
        let code = point.innerHTML
        expect(code.charCodeAt(0).toString(16)).toBe(config.y.shape.slice(3, -1))
      })
    })

    it('should change point color', () => {
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      config.y.color = 'red'
      chart.setConfig(config)
      let points = container.querySelectorAll('.scatter-plot .point')
      _.each(points, point => {
        let pointColor = point.getAttribute('fill')
        expect(pointColor).toBe('red')
      })
    })

    it('should change size accessor', () => {
      data = [
        {x: 0, y: 1, b: 2, a: 1},
        {x: 1, y: 0, b: 5, a: 2},
        {x: 2, y: 3, b: 1, a: 3},
        {x: 3, y: 4, b: 5, a: 4},
        {x: 4, y: 3, b: 3, a: 5},
      ]
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      config.size.accessor = 'a'
      chart.setConfig(config)
      let points = container.querySelectorAll('.scatter-plot .point')
      _.each(points, (point, i) => {
        if (i > 0) {
          let pointSize = point.style.fontSize
          let beforePointSize = points[i - 1].style.fontSize
          expect(+pointSize.slice(0, -2)).toBeGreaterThan(+beforePointSize.slice(0, -2))
        }
      })
    })
  })
})
