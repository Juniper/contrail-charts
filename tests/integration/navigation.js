/* global cc, describe, it, expect, beforeEach afterEach */
describe('Navigation', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      id: 'chart',

      components: [{
        id: 'compositey-chart-id',
        type: 'CompositeY',
        config: {
          duration: 0,
          margin: {
            left: 16,
            right: 20,
          },
          height: 400,
          chartTypes: {
            y1: ['Line'],
          },
          plot: {
            x: {
              accessor: 'x',
              labelFormatter: 'X Values',
              axis: 'x',
            },
            y: [
              {
                accessor: 'y',
                labelFormatter: 'Label Y',
                color: '#d62728',
                chart: 'Line',
                axis: 'y1',
              }
            ]
          },
          axes: {
            x: {
              scale: 'scaleLinear',
              label: 'X',
            },
            y1: {
              position: 'left',
              domain: [0, 2],
            }
          },
        },
      }, {
        id: 'nav',
        type: 'Navigation',
        duration: 0,
        config: {
          duration: 0,
          margin: {
            left: 16,
          },
          height: 200,
          update: ['compositey-chart-id'],
          plot: {
            x: {
              accessor: 'x',
              labelFormatter: 'X Values',
            },
            y: [
              {
                accessor: 'y',
                labelFormatter: 'Label Y',
                chart: 'Line',
              }
            ]
          },
          axis: {
            x: {
              scale: 'scaleLinear',
            },
            y: {
              ticks: 5,
            },
          }
        },
      }]
    }
    data = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},

    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should show half line', (done) => {
      chart = new cc.composites.CompositeView({config, container})
      chart.setData(data)
      let navclipPath = container.querySelector('#nav clipPath rect')
      let navWidth = navclipPath.getBoundingClientRect().width
      let brush = chart.composite._components[1]._brush
      brush.config.set('selection', [navWidth / 2, navWidth])
      let line = container.querySelector('#compositey-chart-id-y1-y path.line')

      setTimeout(() => {
        let d = line.getAttribute('d')
        let lineStartPoint = getPathStartPoint(d)
        let lineEndPoint = getPathEndPoint(d)
        expect(Math.abs(lineStartPoint.split(',')[0])).toBe(+lineEndPoint.split(',')[0])
        done()
      }, 0)
    })
  })
})