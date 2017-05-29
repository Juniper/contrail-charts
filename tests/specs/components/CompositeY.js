/* global cc, describe, it, expect, beforeEach afterEach */

describe('Composite Y view', () => {
  let config
  let chart
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    config = {
      duration: 0,
      plot: {
        x: {accessor: 'x'},
        y: [{accessor: 'a'}]
      },
      axes: {
        x: {scale: 'scaleLinear'},
        y: {}
      },
    }
    data = [
      { x: 0, a: 0, b: 0, c: 2 },
      { x: 1, a: 2, b: 4, c: 2 },
      { x: 2, a: 4, b: 8, c: 3 },
      { x: 3, a: 6, b: 12, c: 1 },
      { x: 4, a: 8, b: 14, c: 5 },
    ]
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should accept single accessor and render "Line"', () => {
      // config.plot.y[0].chart = 'Line'
      chart = new cc.composites.CompositeYView({config, container})
      chart.setData(data)
      expect(container.querySelectorAll('.line.child').length).toEqual(1)
    })

    it('should accept single accessor and render x and y axes', () => {
      chart = new cc.composites.CompositeYView({config, container})
      chart.setData(data)
      expect(container.querySelectorAll('.axis.x').length).toEqual(1)
      expect(container.querySelectorAll('.axis.y').length).toEqual(1)
    })
  })

  describe('Render with non-default config.', () => {
    describe('Change child component type.', () => {
      it('Line => Stacked Bar', () => {
        config.plot.y[0].chart = 'StackedBar'
        config.plot.y.push({
          accessor: 'b',
          chart: 'StackedBar'
        })
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelector('g.stacked-bar')).not.toBeNull()
        expect(container.querySelectorAll('rect.bar').length).toEqual(10)
      })

      it('Line => Grouped Bar', () => {
        config.plot.y[0].chart = 'GroupedBar'
        config.plot.y.push({
          accessor: 'b',
          chart: 'GroupedBar'
        })
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelector('g.grouped-bar')).not.toBeNull()
        expect(container.querySelectorAll('rect.bar').length).toEqual(10)
      })

      it('Line => ScatterPlot', () => {
        config.plot.y[0].chart = 'ScatterPlot'
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelectorAll('text.point').length).toEqual(5)
      })

      it('Line => Area', () => {
        config.plot.y[0].chart = 'Area'
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelectorAll('path.area').length).toEqual(1)
      })
    })

    describe('Render various combinations of components', () => {
      describe('Line on y axis and Area on y1 axis', () => {
        it('area path should include the end point of the line', (done) => {
          data = [
            { x: 0, a: 0, b: 0 },
            { x: 1, a: 2, b: 4 },
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Area',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let line = container.querySelector('path.line')
          let area = container.querySelector('path.area')

          observe('attr', line, 'd', () => {
            let lineD = line.getAttribute('d')
            let areaD = area.getAttribute('d')
            let lineEndPoint = getPathEndPoint(lineD)

            expect(areaD).toContain(lineEndPoint)
            done()
          })
        })

        it('the y1 axis should be right', () => {
          data = [
            { x: 0, a: 0, b: 0 },
            { x: 1, a: 2, b: 4 },
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Area',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let axis = container.querySelector('g.axis.y1')
          let tick = axis.querySelector('.tick')
          let lineX2 = tick.querySelector('line').getAttribute('x2')
          let textX = tick.querySelector('text').getAttribute('x')

          expect(+lineX2 + 10).toBe(+textX)
        })

        it('Checking the correctness z-index positions of elements Line and Area', () => {
          data = [
            { x: 0, a: 0, b: 0 },
            { x: 1, a: 2, b: 4 },
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Area',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let svg = container.querySelector('svg')
          let components = []
          _.each(svg.children, (elem, i) => {
            if (elem.classList.value === 'line child') {
              components.push(elem)
            }
            if (elem.classList.value === 'area child') {
              components.push(elem)
            }
          })
          let firstComponentOrder = components[0].getAttribute('data-order')
          let lastComponentOrder = components[1].getAttribute('data-order')
          expect(+firstComponentOrder).toBeGreaterThan(+lastComponentOrder)
        })
      })

      describe('Line on y axis and Stacked Bar on y1 axis', () => {
        it('the end of line should be in the middle of the top of the last bar', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 3, c: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let line = container.querySelector('path.line')
          let rect = container.querySelectorAll('rect.bar')

          observe('attr', line, 'd', () => {
            let path = line.getAttribute('d')
            let lineEndPoint = getPathEndPoint(path)
            let lastBarY = rect[data.length * 2 - 1].getAttribute('y')
            let lastBarX = rect[data.length * 2 - 1].getAttribute('x')
            let barWidth = rect[data.length * 2 - 1].getAttribute('width')
            let barMiddleX = +lastBarX + (+barWidth / 2)

            expect(lineEndPoint).toBe(`${barMiddleX},${lastBarY}`)
            done()
          })
        })

        it('Checking the correctness of the columns position along the x axis', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 3, c: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          config.axes.x.ticks = 2
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let rects = container.querySelectorAll('rect.bar')
          let xTics = container.querySelectorAll('.axis.x .tick')
          let tickPosition = _.map(xTics, (tick) => {
            let transform = tick.getAttribute('transform')
            let start = transform.indexOf('(') + 1
            let end = transform.indexOf(')')
            return transform.slice(start, end)
          })

          observe('attr', rects[rects.length - 1], 'height', () => {
            let bars = container.querySelectorAll('rect.bar')
            let barWidth = bars[0].getAttribute('width')

            let length = bars.length
            let j = 0
            for (let i = 0; i < length; i += 2) {
              let barX = bars[i].getAttribute('x')
              let barMiddleX = +barX + (+barWidth / 2)
              expect(tickPosition[j]).toBe(`${barMiddleX},0`)
              j++
            }
            done()
          })
        })

        it('The total height of the last two bars should be equal to the height of the parent container', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 3, c: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let rects = container.querySelectorAll('rect.bar')

          observe('attr', rects[rects.length - 1], 'height', () => {
            let lastBarRect = rects[rects.length - 1].getBoundingClientRect()
            let beforeLastBarRect = rects[rects.length - 2].getBoundingClientRect()
            let barsContainerRect = container.querySelector('g.stacked-bar').getBoundingClientRect()

            expect(lastBarRect.height + beforeLastBarRect.height).toBe(barsContainerRect.height)
            done()
          })
        })

        it('Checking the correctness z-index positions of elements Line and Stacked Bar', () => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 3, c: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let svg = container.querySelector('svg')
          let components = []
          _.each(svg.children, (elem, i) => {
            if (elem.classList.value === 'line child') {
              components.push(elem)
            }
            if (elem.classList.value === 'stacked-bar child') {
              components.push(elem)
            }
          })
          let firstComponentOrder = components[0].getAttribute('data-order')
          let lastComponentOrder = components[1].getAttribute('data-order')
          expect(+firstComponentOrder).toBeGreaterThan(+lastComponentOrder)
        })
      })

      describe('Line on y axis and GroupedBar on y1 axis', () => {
        it('The height of bigest bar should be equal to height of the parent container', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 2, c: 3 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let rects = container.querySelectorAll('rect.bar')

          observe('attr', rects[rects.length - 1], 'height', () => {
            let lastBarRect = rects[rects.length - 1].getBoundingClientRect()
            let barsContainerRect = container.querySelector('g.grouped-bar').getBoundingClientRect()

            expect(lastBarRect.height).toBe(barsContainerRect.height)
            done()
          })
        })

        it('Checking the correctness of the columns position along the x axis', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 2, c: 3 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          config.axes.x.ticks = 2
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let rects = container.querySelectorAll('rect.bar')

          observe('attr', rects[rects.length - 1], 'height', () => {
            let xTics = container.querySelectorAll('.axis.x .tick')
            let j = 0
            _.each(xTics, (tick, i) => {
              let tickTransform = tick.getAttribute('transform')
              let tickPosition = tickTransform.slice(tickTransform.indexOf('(') + 1, -1)
              let xtickPosition = +tickPosition.slice(0, tickPosition.indexOf(','))
              let groupedBarsEndXPosition = +rects[j + 1].getAttribute('width') + +rects[j + 1].getAttribute('x')
              let groupedBarStartXPosition = +rects[j].getAttribute('x')
              let groupMiddle = groupedBarStartXPosition + (groupedBarsEndXPosition - groupedBarStartXPosition) / 2
              expect(groupMiddle).toBe(xtickPosition)
              j += 2
            })
            done()
          })
        })

        it('should apply default colors', (done) => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 2, c: 3 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }

          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let rects = container.querySelectorAll('rect.bar')
          let evenColor = d3.schemeCategory20[0]
          let eventRgb = hexToRGB(parseInt(evenColor.slice(1), 16))
          let oddColor = d3.schemeCategory20[1]
          let oddRgb = hexToRGB(parseInt(oddColor.slice(1), 16))

          observe('attr', rects[rects.length - 1], 'height', () => {
            _.each(rects, (rect, i) => {
              let color = rect.getAttribute('fill')
              if (i % 2) {
                expect(color).toBe(oddRgb)
              } else {
                expect(color).toBe(eventRgb)
              }
            })
            done()
          })
        })

        it('Checking the correctness z-index positions of elements Line and Grouped Bar', () => {
          data = [
            { x: 0, a: 0, b: 0, c: 1 },
            { x: 1, a: 1, b: 2, c: 2 },
            { x: 2, a: 2, b: 3, c: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let svg = container.querySelector('svg')
          let components = []
          _.each(svg.children, (elem, i) => {
            if (elem.classList.value === 'line child') {
              components.push(elem)
            }
            if (elem.classList.value === 'grouped-bar child') {
              components.push(elem)
            }
          })
          let firstComponentOrder = components[0].getAttribute('data-order')
          let lastComponentOrder = components[1].getAttribute('data-order')
          expect(+firstComponentOrder).toBeGreaterThan(+lastComponentOrder)
        })
      })
    })
  })
})
