/* global cc, describe, it, expect, beforeEach afterEach */

describe('AreaView', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      x: {
        accessor: 'group.x',
        labelFormatter: 'Value',
      },
      y: [
        {
          accessor: 'group.a',
          stack: 'first',
          labelFormatter: 'Label Group.A',
          color: 'red',
        },
        {
          accessor: 'b',
          stack: 'second',
          labelFormatter: 'Label B',
          color: 'green',
        },
        {
          accessor: 'c',
          stack: 'second',
          color: 'orange',
        }
      ]
    }
    data = [
      { b: 0, c: 0, group: {a: 1, x: 0} },
      { b: -2, c: -4, group: {a: 8, x: 1} },
      { b: 0, c: 0, group: {a: 5, x: 2} },
      { b: -2, c: -8, group: {a: 0, x: 3} },
      { b: -5, c: -10, group: {a: 2, x: 4} },
    ]
    chart = new cc.components.AreaView({config, container})
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with default config.', () => {
    it('Area chart rendered with default config', () => {
      config = {
        x: {
          accessor: 'group.x'
        },
        y: [
          {
            accessor: 'group.a'
          },
          {
            stack: 'negative',
            accessor: 'b'
          }
        ]
      }
      chart.setConfig(config)
      chart.setData(data)
      expect(chart.el.querySelectorAll('path.area').length).toEqual(2)
    })

    it('should render with default color schema', (done) => {
      config = {
        x: {
          accessor: 'group.x'
        },
        y: [
          {
            accessor: 'group.a'
          },
          {
            stack: 'negative',
            accessor: 'b'
          }
        ]
      }
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[1]

      observer('attr', path, 'd', () => {
        let chartAreas = container.querySelectorAll('path.area')
        let i = 0
        _.forEach(chartAreas, function (area) {
          let hex = d3.schemeCategory20[i]
          let rgb = hexToRGB(parseInt(hex.slice(1), 16))
          let color = area.getAttribute('fill')

          expect(color).toBe(rgb)
          i++
        })
        done()
      })
    })
  })

  describe('Render with changed config.', () => {
    it('should apply margin-top and margin-left to view element', () => {
      config.margin = {left: 20, top: 10}
      chart.setConfig(config)
      chart.setData(data)
      let el = container.querySelector('g.area')

      expect(el.getAttribute('transform')).toBe('translate(20,10)')
    })

    it('should applay margin-bottom and margin-right to view element', (done) => {
      config.margin = {right: 10, bottom: 5}
      data = [
        { b: 0, c: 0, group: {a: 1, x: 0} },
        { b: -2, c: -4, group: {a: 2, x: 1} },
        { b: 0, c: 0, group: {a: 3, x: 2} },
        { b: -2, c: -8, group: {a: 4, x: 3} },
        { b: -5, c: -10, group: {a: 5, x: 4} },
      ]
      chart.setConfig(config)
      chart.setData(data)
      let svg = container.querySelector('svg')
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let areasContainer = container.querySelector('g.area')
        let areasContainerRect = areasContainer.getBoundingClientRect()
        let svgRect = svg.getBoundingClientRect()

        expect(svgRect.width - areasContainerRect.width).toBe(config.margin.right)
        expect(svgRect.height - areasContainerRect.height).toBe(config.margin.bottom)
        done()
      })
    })

    it('should apply colors to areas', (done) => {
      config.y[0].color = '#FF0000'
      config.y[1].color = '#00FF00'
      config.y[2].color = '#0000FF'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let i = 0
        _.forEach(paths, (path) => {
          let rgb = hexToRGB(parseInt(config.y[i].color.slice(1), 16))
          expect(path.getAttribute('fill')).toBe(rgb)
          i++
        })
        done()
      })
    })

    it('should apply correct one stack', (done) => {
      data = [
        { b: -1, c: -1, group: {a: -1, x: 0} },
        { b: -1, c: -1, group: {a: -1, x: 1} },
        { b: -1, c: -1, group: {a: -1, x: 2} }
      ]
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'firstGroup'
      config.y[2].stack = 'firstGroup'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstD = paths[0].getAttribute('d')
        let secondD = paths[1].getAttribute('d')
        let thirdD = paths[2].getAttribute('d')

        let beforeLastCommaIndex = firstD.lastIndexOf(',', firstD.lastIndexOf(',') - 1)
        let firstEndPoint = firstD.slice(beforeLastCommaIndex + 1, -1)

        let secondStartPoint = secondD.slice(1, secondD.indexOf('C'))
        beforeLastCommaIndex = secondD.lastIndexOf(',', secondD.lastIndexOf(',') - 1)
        let secondEndPoint = secondD.slice(beforeLastCommaIndex + 1, -1)

        let thridStartPoint = thirdD.slice(1, thirdD.indexOf('C'))

        expect(firstEndPoint).toBe(secondStartPoint)
        expect(secondEndPoint).toBe(thridStartPoint)
        done()
      })
    })

    it('should apply corect two stack', (done) => {
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'firstGroup'
      config.y[2].stack = 'secondGroup'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstD = paths[0].getAttribute('d')
        let secondD = paths[1].getAttribute('d')
        let thirdD = paths[2].getAttribute('d')

        let firstStartPoint = firstD.slice(1, firstD.indexOf('C'))
        let beforeLastCommaIndex = firstD.lastIndexOf(',', firstD.lastIndexOf(',') - 1)
        let firstEndPoint = firstD.slice(beforeLastCommaIndex + 1, -1)

        let secondStartPoint = secondD.slice(1, secondD.indexOf('C'))
        let thridStartPoint = thirdD.slice(1, thirdD.indexOf('C'))

        expect(firstEndPoint).toBe(secondStartPoint)
        expect(firstStartPoint).toBe(thridStartPoint)
        done()
      })
    })

    it('should apply correct three stack', (done) => {
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'secondGroup'
      config.y[2].stack = 'thirdGroup'
      chart.setConfig(config)
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstD = paths[0].getAttribute('d')
        let secondD = paths[1].getAttribute('d')
        let thirdD = paths[2].getAttribute('d')

        let firstStartPoint = firstD.slice(1, firstD.indexOf('C'))
        let secondStartPoint = secondD.slice(1, secondD.indexOf('C'))
        let thridStartPoint = thirdD.slice(1, thirdD.indexOf('C'))

        expect(firstStartPoint).toBe(secondStartPoint)
        expect(secondStartPoint).toBe(thridStartPoint)
        done()
      })
    })
  })

  describe('Render with data variants.', () => {
    describe('Render with extremum data.', () => {
      it('should not exceed container height', (done) => {
        data = [
          { group: {a: 1, x: 0} },
          { group: {a: 8, x: 1} },
          { group: {a: 5, x: 2} },
          { group: {a: 0, x: 3} },
          { group: {a: 2, x: 4} },
        ]
        config = {
          x: {
            accessor: 'group.x',
          },
          y: [
            {
              accessor: 'group.a',
            }
          ]
        }
        chart.setConfig(config)
        chart.setData(data)
        let svg = container.querySelector('svg')
        let path = container.querySelector('path.area')

        observer('attr', path, 'd', () => {
          let areasContainer = container.querySelector('g.area')
          let areasContainerRect = areasContainer.getBoundingClientRect()
          let svgRect = svg.getBoundingClientRect()

          if (svgRect.height === areasContainerRect.height) {
            expect(svgRect.height).toBe(areasContainerRect.height)
            done()
          }
          expect(svgRect.height).toBeGreaterThan(areasContainerRect.height)
          done()
        })
      })

      it('should not exceed container width', (done) => {
        data = [
          { group: {a: 0, x: 2} },
          { group: {a: 1, x: 4} },
          { group: {a: 2, x: 0} },
          { group: {a: 3, x: 5} },
          { group: {a: 4, x: 2} },
          { group: {a: 5, x: 0} }
        ]
        config = {
          x: {accessor: 'group.x'},
          y: [{accessor: 'group.a'}]
        }
        chart.setConfig(config)
        chart.setData(data)
        let svg = container.querySelector('svg')
        let path = container.querySelector('path.area')

        observer('attr', path, 'd', () => {
          let areasContainer = container.querySelector('g.area')
          let areasContainerRect = areasContainer.getBoundingClientRect()
          let svgRect = svg.getBoundingClientRect()

          if (svgRect.width === areasContainerRect.widht) {
            expect(svgRect.width).toBe(areasContainerRect.width)
            done()
          }
          expect(svgRect.width).toBeGreaterThan(areasContainerRect.width)
          done()
        })
      })
    })

    it('should not exceed container height with second negative value stack', (done) => {
      data = [
        { b: -1, group: {a: 0, x: 1} },
        { b: -1, group: {a: 1, x: 2} },
        { b: -1, group: {a: 2, x: 3} },
        { b: -1, group: {a: 3, x: 4} },
        { b: -1, group: {a: 4, x: 5} },
        { b: -1, group: {a: 5, x: 6} }
      ]
      config = {
        x: {accessor: 'group.x'},
        y: [
          {
            accessor: 'group.a',
            stack: 'group'
          },
          {
            accessor: 'b',
            stack: 'group'
          }]
      }
      chart.setConfig(config)
      chart.setData(data)
      let svg = container.querySelector('svg')
      let path = container.querySelector('path.area')

      observer('attr', path, 'd', () => {
        let areasContainer = container.querySelector('g.area')
        let areasContainerRect = areasContainer.getBoundingClientRect()
        let svgRect = svg.getBoundingClientRect()

        if (svgRect.height === areasContainerRect.height) {
          expect(svgRect.height).toBe(areasContainerRect.height)
          done()
        }
        expect(svgRect.height).toBeGreaterThan(areasContainerRect.height)
        done()
      })
    })

    it('should render empty chart without data', (done) => {
      chart.render()
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'fill', () => {
        let paths = container.querySelectorAll('path.area')
        _.forEach(paths, (path) => {
          expect(path.getAttribute('d')).toBeNull()
        })
        done()
      })
    })

    it('should render empty chart with empty data', (done) => {
      chart.setData([])
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'fill', () => {
        let paths = container.querySelectorAll('path.area')
        _.forEach(paths, (path) => {
          expect(path.getAttribute('d')).toBeNull()
        })
        done()
      })
    })

    it('should render one point', (done) => {
      chart.setData([{ b: 1, c: 1, group: {a: 1, x: 0} }])
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let areasContainer = container.querySelector('g.area')
        let areasContainerHeight = areasContainer.getBoundingClientRect().height
        _.forEach(paths, (path) => {
          expect(path.getAttribute('d')).toBe(`M0,${areasContainerHeight}L0,0Z`)
        })
        done()
      })
    })

    it('should correctly calculate position of two points', (done) => {
      config.width = 300
      config.height = 200
      chart.setConfig(config)
      data = [
        { group: {a: 1, x: 0} },
        { group: {a: 2, x: 1} }
      ]
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observer('attr', path, 'd', () => {
        let path = container.querySelector('path.area')
        expect(path.getAttribute('d')).toBe(`M0,${config.height}L${config.width},${config.height}L${config.width},0L0,100Z`)
        done()
      })
    })

    it('should render with NaN data on x', () => {
      data = [
        { group: {a: 1, x: 0} },
        { group: {a: 2, x: NaN} },
        { group: {a: 3, x: 2} },
        { group: {a: 4, x: 3} }
      ]
      chart.setData(data)
      expect(chart.model.data.length).toBe(3)
      expect(container.querySelector('path.line')).toBeDefined()
    })

    it('should render with undefined data on x', () => {
      data = [
        { group: {a: 1, x: 0} },
        { group: {a: 2, x: undefined} },
        { group: {a: 3, x: 2} },
        { group: {a: 4, x: 3} }
      ]
      chart.setData(data)
      expect(chart.model.data.length).toBe(3)
      expect(container.querySelector('path.line')).toBeDefined()
    })

    it('should render with NaN data on y', (done) => {
      data = [
        { group: {a: 1, x: 0} },
        { group: {a: NaN, x: 1} },
        { group: {a: 3, x: 2} },
        { group: {a: 4, x: 3} }
      ]
      chart.setData(data)
      let path = container.querySelector('path.area')

      observer('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })

    it('should render with undefined data on y', (done) => {
      data = [
        { group: {a: 1, x: 0} },
        { group: {a: undefined, x: 1} },
        { group: {a: 3, x: 2} },
        { group: {a: 4, x: 3} }
      ]
      chart.setData(data)
      let path = container.querySelector('path.area')

      observer('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })
  })
})