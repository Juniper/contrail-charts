/* global cc, describe, it, expect, beforeEach afterEach */

describe('ScatterPlotView.', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')
  const bubbleShapes = cc.Util.bubbleShapes

  beforeEach(() => {
    config = {
      height: 450,
      x: {
        accessor: 'x',
      },
      y: {
        accessor: 'y',
        shape: bubbleShapes.circle,
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
      {x: 4, y: 5, b: 3},
    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should render points', () => {
      config = {
        x: {
          accessor: 'x',
        },
        y: {
          accessor: 'y',
          shape: bubbleShapes.circle,
        },
        size: {
          accessor: 'b',
        }
      }
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot text')
      expect(points.length).toBe(5)
    })

    it('should apply points icon', () => {
      config = {
        x: {
          accessor: 'x',
        },
        y: {
          accessor: 'y',
          shape: bubbleShapes.circle,
        },
        size: {
          accessor: 'b',
        }
      }
      chart = new cc.components.ScatterPlotView({config, container})
      chart.setData(data)
      let points = container.querySelectorAll('.scatter-plot text')
      _.each(points, (point) => {
        let code = point.innerHTML
        expect(code.charCodeAt(0).toString(16)).toBe(bubbleShapes.circle.slice(3, -1))
      })
    })
  })
})
