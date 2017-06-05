/* global cc, describe, it, expect, beforeEach afterEach */

describe('Area Component', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      duration: 0,
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
        }, {
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
      {b: 0, c: 0, group: {a: 1, x: 0}},
      {b: -2, c: -4, group: {a: 8, x: 1}},
      {b: 0, c: 0, group: {a: 5, x: 2}},
      {b: -2, c: -8, group: {a: 0, x: 3}},
      {b: -5, c: -10, group: {a: 2, x: 4}},
    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should accept single accessor', () => {
      config = {
        x: {accessor: 'group.x'},
        y: [{accessor: 'group.a'}]
      }
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      expect(chart.el.querySelectorAll('path.area').length).toEqual(1)
    })

    it('should apply default colors', done => {
      config = {
        x: {accessor: 'group.x'},
        y: [{accessor: 'group.a'}, {accessor: 'b'}]
      }
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[1]

      observe('attr', path, 'd', () => {
        let chartAreas = container.querySelectorAll('path.area')
        _.each(chartAreas, (area, i) => {
          let hex = d3.schemeCategory20[i]
          let rgb = hexToRGB(parseInt(hex.slice(1), 16))
          let color = area.getAttribute('fill')

          expect(color).toBe(rgb)
        })
        done()
      })
    })
  })

  describe('Render with non-default config.', () => {
    it('should apply top and left margin', () => {
      config.margin = {left: 20, top: 10}
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let el = container.querySelector('g.area')

      expect(el.getAttribute('transform')).toBe('translate(20,10)')
    })

    it('should apply bottom and right margin', (done) => {
      config.margin = {right: 10, bottom: 5}
      // use linear data to avoid area exceeding it's projected size
      data = [
        { b: 0, c: 0, group: {a: 0, x: 0} },
        { b: 1, c: 1, group: {a: -1, x: 1} },
        { b: 2, c: 2, group: {a: -2, x: 2} },
      ]
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let svg = container.querySelector('svg')
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'd', () => {
        let areaContainer = container.querySelector('g.area')
        let areaContainerRect = areaContainer.getBoundingClientRect()
        let svgRect = svg.getBoundingClientRect()

        expect(svgRect.width - areaContainerRect.width).toBe(config.margin.right)
        expect(svgRect.height - areaContainerRect.height).toBe(config.margin.bottom)
        done()
      })
    })

    it('should apply colors to areas', (done) => {
      config.y[0].color = '#FF0000'
      config.y[1].color = '#00FF00'
      config.y[2].color = '#0000FF'
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        _.each(paths, (path, i) => {
          let rgb = hexToRGB(parseInt(config.y[i].color.slice(1), 16))
          expect(path.getAttribute('fill')).toBe(rgb)
        })
        done()
      })
    })

    it('should stack areas on top of each other', (done) => {
      data = [
        {b: -1, c: -1, a: -1, x: 0},
        {b: -1, c: -1, a: -1, x: 1},
        {b: -1, c: -1, a: -1, x: 2}
      ]
      config.x.accessor = 'x'
      config.y[0].accessor = 'a'
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'firstGroup'
      config.y[2].stack = 'firstGroup'
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstRect = paths[0].getBoundingClientRect()
        let secondRect = paths[1].getBoundingClientRect()
        let thirdRect = paths[2].getBoundingClientRect()

        expect(firstRect.top + firstRect.height).toBe(secondRect.top)
        expect(secondRect.top + secondRect.height).toBe(thirdRect.top)
        done()
      })
    })

    it('should combine areas in two stacks', (done) => {
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'firstGroup'
      config.y[2].stack = 'secondGroup'
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstD = paths[0].getAttribute('d')
        let secondD = paths[1].getAttribute('d')
        let thirdD = paths[2].getAttribute('d')

        let firstStartPoint = getPathStartPoint(firstD)
        let firstEndPoint = getPathEndPoint(firstD)
        let secondStartPoint = getPathStartPoint(secondD)
        let thridStartPoint = getPathStartPoint(thirdD)

        expect(firstEndPoint).toBe(secondStartPoint)
        expect(firstStartPoint).toBe(thridStartPoint)
        done()
      })
    })

    it('should render each area on the same baseline', (done) => {
      config.y[0].stack = 'firstGroup'
      config.y[1].stack = 'secondGroup'
      config.y[2].stack = 'thirdGroup'
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let firstD = paths[0].getAttribute('d')
        let secondD = paths[1].getAttribute('d')
        let thirdD = paths[2].getAttribute('d')

        let firstStartPoint = getPathStartPoint(firstD)
        let secondStartPoint = getPathStartPoint(secondD)
        let thridStartPoint = getPathStartPoint(thirdD)

        expect(firstStartPoint).toBe(secondStartPoint)
        expect(secondStartPoint).toBe(thridStartPoint)
        done()
      })
    })
  })

  describe('Render with data variants.', () => {
    describe('Render with extremum data.', () => {
      describe('should not exceed container size', () => {
        xit('should not exceed container height', (done) => {
          data = [
            {a: 1, x: 0},
            {a: 8, x: 1},
            {a: 5, x: 2},
            {a: 0, x: 3},
            {a: 2, x: 4},
          ]
          config = {
            x: {accessor: 'x'},
            y: [{accessor: 'a'}]
          }
          chart = new cc.components.AreaView({config, container})
          chart.setData(data)
          let svg = container.querySelector('svg')
          let path = container.querySelector('path.area')

          observe('attr', path, 'd', () => {
            let areaContainer = container.querySelector('g.area')
            let areaContainerRect = areaContainer.getBoundingClientRect()
            let svgRect = svg.getBoundingClientRect()

            expect(svgRect.height).toBeGreaterThanOrEqual(areaContainerRect.height)
            done()
          })
        })

        xit('should not exceed container width', (done) => {
          data = [
            {x: 2, a: 0},
            {x: 5, a: 1},
            {x: 0, a: 2},
            {x: 2, a: 3}
          ]
          config = {
            x: {accessor: 'x'},
            y: [{accessor: 'a'}]
          }
          chart = new cc.components.AreaView({config, container})
          chart.setData(data)
          let svg = container.querySelector('svg')
          let path = container.querySelector('path.area')

          observe('attr', path, 'd', () => {
            let areaContainer = container.querySelector('g.area')
            let areaContainerRect = areaContainer.getBoundingClientRect()
            let svgRect = svg.getBoundingClientRect()

            expect(svgRect.width).toBeGreaterThanOrEqual(areaContainerRect.width)
            done()
          })
        })
      })

      xit('second area in stack with negative values should fit container', (done) => {
        data = [
          {x: 1, b: -1, a: 0},
          {x: 2, b: -1, a: 1},
          {x: 3, b: -1, a: 2},
        ]
        config = {
          x: {accessor: 'x'},
          y: [
            {
              accessor: 'a',
              stack: 'group'
            },
            {
              accessor: 'b',
              stack: 'group'
            }]
        }
        chart = new cc.components.AreaView({config, container})
        chart.setData(data)
        let svg = container.querySelector('svg')
        let path = container.querySelector('path.area')

        observe('attr', path, 'd', () => {
          let areaContainer = container.querySelector('g.area')
          let areaContainerRect = areaContainer.getBoundingClientRect()
          let svgRect = svg.getBoundingClientRect()

          expect(svgRect.height).toBeGreaterThanOrEqual(areaContainerRect.height)
          done()
        })
      })
    })

    xit('should render empty chart without data', (done) => {
      chart = new cc.components.AreaView({config, container})
      chart.render()
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'fill', () => {
        let paths = container.querySelectorAll('path.area')
        _.each(paths, (path) => {
          expect(path.getAttribute('d')).toBeNull()
        })
        done()
      })
    })

    it('should render empty chart with empty data', (done) => {
      chart = new cc.components.AreaView({config, container})
      chart.setData([])
      let path = container.querySelectorAll('path.area')[2]

      observe('attr', path, 'fill', () => {
        let paths = container.querySelectorAll('path.area')
        _.each(paths, (path) => {
          expect(path.getAttribute('d')).toBeNull()
        })
        done()
      })
    })

    it('should render one point', (done) => {
      config = {
        x: {accessor: 'x'},
        y: [{accessor: 'a'}]
      }
      chart = new cc.components.AreaView({config, container})
      chart.setData([{b: 1, c: 1, a: 1, x: 0}])
      let path = container.querySelector('path.area')

      observe('attr', path, 'd', () => {
        let paths = container.querySelectorAll('path.area')
        let areaContainer = container.querySelector('g.area')
        let areaContainerHeight = areaContainer.getBoundingClientRect().height
        _.forEach(paths, (path) => {
          expect(path.getAttribute('d')).toBe(`M0,${areaContainerHeight}L0,0Z`)
        })
        done()
      })
    })

    it('should correctly calculate position of two points', (done) => {
      config = {
        width: 300,
        height: 200,
        x: {accessor: 'x'},
        y: [{accessor: 'a'}]
      }
      chart = new cc.components.AreaView({config, container})
      data = [
        {x: 0, a: 1},
        {x: 1, a: 2}
      ]
      chart.setData(data)
      let path = container.querySelector('path.area')

      observe('attr', path, 'd', () => {
        let path = container.querySelector('path.area')
        expect(path.getAttribute('d')).toBe(`M0,${config.height}L${config.width},${config.height}L${config.width},0L0,100Z`)
        done()
      })
    })

    xit('should render with NaN data on y', (done) => {
      config = {
        x: {accessor: 'x'},
        y: [{accessor: 'a'}]
      }
      chart = new cc.components.AreaView({config, container})
      data = [
        {x: 0, a: 1},
        {x: 1, a: NaN},
        {x: 2, a: 3}
      ]
      chart.setData(data)
      let path = container.querySelector('path.area')

      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })

    xit('should render with undefined data on y', (done) => {
      config = {
        x: {accessor: 'x'},
        y: [{accessor: 'a'}]
      }
      chart = new cc.components.AreaView({config, container})
      data = [
        {x: 0, a: 1},
        {x: 1, a: undefined},
        {x: 2, a: 3}
      ]
      chart.setData(data)
      let path = container.querySelector('path.area')

      observe('attr', path, 'd', () => {
        let d = path.getAttribute('d')
        expect(d).not.toContain('NaN')
        done()
      })
    })
  })

  describe('Change config after render', () => {
    it('should chang y accessor group.a => c', (done) => {
      config = {
        duration: 0,
        x: {accessor: 'group.x'},
        y: [{accessor: 'group.a'}]
      }
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.y[0].accessor = 'c'
        chart.setConfig(config)
        let path = container.querySelector('path.area')
        observe('attr', path, 'd', () => {
          let pathD = path.getAttribute('d')
          let areaStartPoint = getPathStartPoint(pathD)

          // line with data by accessor b must start with 0,0 coordinat
          expect(areaStartPoint).toBe('0,0')
          done()
        })
      }, 0)
    })

    it('should chang color red => green', (done) => {
      config = {
        duration: 0,
        x: {accessor: 'group.x'},
        y: [{accessor: 'group.a'}]
      }
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.y[0].color = 'green'
        chart.setConfig(config)
        let path = container.querySelector('path.area')
        observe('attr', path, 'fill', () => {
          let color = path.getAttribute('fill')

          expect(color).toBe('rgb(0, 128, 0)')
          done()
        })
      }, 0)
    })

    it('should add to first stack accessor c', (done) => {
      chart = new cc.components.AreaView({config, container})
      chart.setData(data)

      setTimeout(() => {
        config.y[2].stack = 'first'
        chart.setConfig(config)
        let path = container.querySelectorAll('path.area')[2]
        observe('attr', path, 'd', () => {
          let aArea = container.getElementsByClassName('area-group.a')[0]
          let cArea = container.querySelector('.area-c')
          let aAreaEndPoint = getPathEndPoint(aArea.getAttribute('d'))
          let cAreaStartPoint = getPathStartPoint(cArea.getAttribute('d'))

          expect(aAreaEndPoint).toBe(cAreaStartPoint)
          done()
        })
      }, 0)
    })
  })
})