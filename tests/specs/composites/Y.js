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
    xit('should accept single accessor and render "Line"', () => {
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

    it('check component element is on top of the axes', () => {
      config.plot.y[0].chart = 'Line'
      chart = new cc.composites.CompositeYView({config, container})
      chart.setData(data)
      let line = container.querySelector('.line')
      let svg = container.querySelector('svg')
      let children = _.map(svg.children)

      expect(children.indexOf(line)).toBe(children.length - 1)
    })
  })

  describe('Render with non-default config.', () => {
    describe('different child component type.', () => {
      it('Stacked Bar', () => {
        config.plot.y[0].chart = 'StackedBar'
        // add second accessor
        config.plot.y.push({
          accessor: 'b',
          chart: 'StackedBar'
        })
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelector('g.stacked-bar')).not.toBeNull()
        expect(container.querySelectorAll('rect.bar').length).toEqual(10)
      })

      it('Grouped Bar', () => {
        config.plot.y[0].chart = 'GroupedBar'
        // add second accessor
        config.plot.y.push({
          accessor: 'b',
          chart: 'GroupedBar'
        })
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelector('g.grouped-bar')).not.toBeNull()
        expect(container.querySelectorAll('rect.bar').length).toEqual(10)
      })

      xit('ScatterPlot', () => {
        config.plot.y[0].chart = 'ScatterPlot'
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData(data)
        expect(container.querySelectorAll('text.point').length).toEqual(5)
      })

      it('Area', () => {
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
          // ensure the type for the first accessor is Line
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

        it('the y1 axis should be at right', () => {
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

          expect(+lineX2).toBeLessThan(+textX)
        })

        it('Line should render above Area', () => {
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
          let area = svg.querySelector('.area')
          let line = svg.querySelector('.line')
          let children = _.map(svg.children)

          expect(children.indexOf(area)).toBeLessThan(children.indexOf(line))
        })

        it('Check y and y1 axes ticks are completely overlapped', () => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Area',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let yAxisTicks = container.querySelectorAll('.axis.y .tick')
          let y1AxisTicks = container.querySelectorAll('.axis.y1 .tick')

          expect(yAxisTicks.length).toBe(y1AxisTicks.length)
          _.each(yAxisTicks, (yTick, i) => {
            let yTransform = yTick.getAttribute('transform')
            let y1Transform = y1AxisTicks[i].getAttribute('transform')
            expect(yTransform).toBe(y1Transform)
          })
        })

        it('should apply color', (done) => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Area',
            axis: 'y1',
            color: 'red'
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let area = container.querySelector('path.area')

          observe('attr', area, 'fill', () => {
            let areaColor = area.getAttribute('fill')
            expect(areaColor).toBe('rgb(255, 0, 0)')
            done()
          })
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
          let bars = container.querySelectorAll('rect.bar')

          observe('attr', line, 'd', () => {
            let path = line.getAttribute('d')
            let lineEndPoint = getPathEndPoint(path)
            let lastBar = bars[data.length * 2 - 1]
            let lastBarY = lastBar.getAttribute('y')
            let lastBarX = lastBar.getAttribute('x')
            let barWidth = lastBar.getAttribute('width')
            let barMiddleX = +lastBarX + (+barWidth / 2)

            expect(lineEndPoint).toBe(`${barMiddleX},${lastBarY}`)
            done()
          })
        })
        // TODO fails on Saucelabs
        xit('x axis tick should be below and at the middle of the bar', (done) => {
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
          let xTicks = container.querySelectorAll('.axis.x .tick')
          let tickPositions = _.map(xTicks, (tick) => {
            let transform = tick.getAttribute('transform')
            return transform.match(/\d+\.?\d*,\d+\.?\d*/)[0]
          })

          observe('attr', rects[rects.length - 1], 'height', () => {
            let bars = container.querySelectorAll('rect.bar')
            let barWidth = bars[0].getAttribute('width')

            _.each(tickPositions, (tick, i) => {
              let barX = bars[i * 2].getAttribute('x')
              let barMiddleX = +barX + (+barWidth / 2)
              expect(tickPositions[i]).toBe(`${barMiddleX},0`)
            })
            done()
          })
        })

        it('The total height of the last two bars should be equal to the height of the parent container', done => {
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

            expect(lastBarRect.height + beforeLastBarRect.height).toBeCloseTo(barsContainerRect.height, 2)
            done()
          })
        })

        it('Line should render above Stacked Bar', () => {
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
          let stackedBar = svg.querySelector('.stacked-bar')
          let line = svg.querySelector('.line')
          let children = _.map(svg.children)

          expect(children.indexOf(stackedBar)).toBeLessThan(children.indexOf(line))
        })
      })

      describe('Line on y axis and GroupedBar on y1 axis', () => {
        it('The height of bigest bar should be equal to height of the parent container', done => {
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
        // TODO fails on Saucelabs
        xit('Checking the correctness of the columns position along the x axis', done => {
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
            _.each(xTics, (tick, i) => {
              let tickTransform = tick.getAttribute('transform')
              let xtickPosition = tickTransform.match(/\d+\.?\d*/)[0]
              let groupedBarsEndXPosition = +rects[(i * 2) + 1].getAttribute('width') + +rects[(i * 2) + 1].getAttribute('x')
              let groupedBarStartXPosition = +rects[(i * 2)].getAttribute('x')
              let groupMiddle = groupedBarStartXPosition + (groupedBarsEndXPosition - groupedBarStartXPosition) / 2
              expect(groupMiddle).toBeCloseTo(+xtickPosition)
            })
            done()
          })
        })

        it('should apply default colors', done => {
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
          let evenRgb = hexToRGB(parseInt(evenColor.slice(1), 16))
          let oddColor = d3.schemeCategory20[1]
          let oddRgb = hexToRGB(parseInt(oddColor.slice(1), 16))

          observe('attr', rects[rects.length - 1], 'height', () => {
            _.each(rects, (rect, i) => {
              let color = rect.getAttribute('fill')
              if (i % 2) {
                expect(color).toBe(oddRgb)
              } else {
                expect(color).toBe(evenRgb)
              }
            })
            done()
          })
        })

        it('Line should render above Grouped Bar', () => {
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
          let groupedBar = svg.querySelector('.grouped-bar')
          let line = svg.querySelector('.line')
          let children = _.map(svg.children)

          expect(children.indexOf(groupedBar)).toBeLessThan(children.indexOf(line))
        })
      })

      describe('Render all components', () => {
        xit('check default color scale is applied for all different components', done => {
          data = [
            { x: 0, a: 0, b: 0, c: 2, d: 2, f: 1, g: 0 },
            { x: 1, a: 2, b: 4, c: 2, d: 1, f: 2, g: 1 },
            { x: 2, a: 4, b: 4, c: 3, d: 2, f: 1, g: 2 }
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
          }
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1',
          }
          config.plot.y[3] = {
            accessor: 'd',
            chart: 'Area',
            axis: 'y1',
          }
          config.axes.y1 = { position: 'right' }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let line = container.querySelector('path.line')

          observe('attr', line, 'd', () => {
            let colors = []
            colors.push(line.getAttribute('stroke'))
            let groupedBarRect = container.querySelector('.grouped-bar .bar')
            colors.push(groupedBarRect.getAttribute('fill'))
            let stackedBarRect = container.querySelector('.stacked-bar .bar')
            colors.push(stackedBarRect.getAttribute('fill'))
            let area = container.querySelector('path.area')
            colors.push(area.getAttribute('fill'))
            _.each(colors, (color, i) => {
              let position = colors.indexOf(color)
              let secondPosition = colors.indexOf(color, position + 1)
              if (secondPosition !== -1) {
                expect(color).not.toBe(colors[secondPosition])
              }
            })
            done()
          })
        })
      })
    })

    describe('Render with data variants.', () => {
      describe('Render with extremum data.', () => {
        xit('line should not exceed clipPath height', done => {
          data = [
            { x: 0, a: 0 },
            { x: 1, a: 3 },
            { x: 2, a: 2 },
          ]
          config.plot.y[0].chart = 'Line'
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let line = container.querySelector('path.line')

          observe('attr', line, 'd', () => {
            let clipPath = container.querySelector('clipPath rect')
            let lineTransform = container.querySelector('.line.child').getAttribute('transform')
            let clipPathTransform = container.querySelector('.composite-y').getAttribute('transform')
            let lineRect = line.getBoundingClientRect()
            let clipPathRect = clipPath.getBoundingClientRect()

            expect(lineTransform).toBe(clipPathTransform)
            expect(lineRect.height).toBeLessThanOrEqual(clipPathRect.height)
            done()
          })
        })

        xit('line should not exceed clipPath width', done => {
          data = [
            { x: 0, a: 0 },
            { x: 2, a: 1 },
            { x: 1, a: 2 },
          ]
          config.plot.y[0].chart = 'Line'
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let line = container.querySelector('path.line')

          observe('attr', line, 'd', () => {
            let clipPath = container.querySelector('clipPath rect')
            let lineTransform = container.querySelector('.line.child').getAttribute('transform')
            let clipPathTransform = container.querySelector('.composite-y').getAttribute('transform')
            let lineRect = line.getBoundingClientRect()
            let clipPathRect = clipPath.getBoundingClientRect()

            expect(lineTransform).toBe(clipPathTransform)
            expect(lineRect.width).toBeLessThanOrEqual(clipPathRect.width)
            done()
          })
        })

        it('stackedBar should not exceed clipPath height', done => {
          data = [
            { x: 0, a: 0, b: 0 },
            { x: 1, a: 3, b: 2 },
            { x: 2, a: 3, b: 4 },
          ]
          config.plot.y[0].chart = 'StackedBar'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
            axis: 'y',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let bars = container.querySelectorAll('rect.bar')

          observe('attr', bars[bars.length - 1], 'height', () => {
            let clipPath = container.querySelector('clipPath rect')
            let barsContainer = container.querySelector('.stacked-bar')
            let stackedBarTransform = barsContainer.getAttribute('transform')
            let clipPathTransform = container.querySelector('.composite-y').getAttribute('transform')
            let barsContainerRect = barsContainer.getBoundingClientRect()
            let clipPathRect = clipPath.getBoundingClientRect()

            expect(stackedBarTransform).toBe(clipPathTransform)
            expect(barsContainerRect.height).toBeLessThanOrEqual(clipPathRect.height)
            done()
          })
        })

        it('groupedBar should not exceed clipPath width', done => {
          data = [
            { x: 0, a: 2, b: 1 },
            { x: 1, a: 3, b: 2 },
            { x: 2, a: 3, b: 4 },
          ]
          config.plot.y[0].chart = 'GroupedBar'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          let bars = container.querySelectorAll('rect.bar')

          observe('attr', bars[bars.length - 1], 'height', () => {
            let clipPath = container.querySelector('clipPath rect')
            let barsContainer = container.querySelector('.grouped-bar')
            let groupedBarTransform = barsContainer.getAttribute('transform')
            let clipPathTransform = container.querySelector('.composite-y').getAttribute('transform')
            let barsContainerRect = barsContainer.getBoundingClientRect()
            let clipPathRect = clipPath.getBoundingClientRect()

            expect(groupedBarTransform).toBe(clipPathTransform)
            expect(barsContainerRect.width).toBeLessThanOrEqual(clipPathRect.width)
            done()
          })
        })
      })

      it('should render empty chart without data', () => {
        chart = new cc.composites.CompositeYView({config, container})
        chart.render()
        let svg = container.querySelector('svg')
        let children = _.map(svg.children)
        let line = container.querySelector('path.line')
        // should render composite-y, axis x, axis y
        expect(children.length).toBe(3)
        expect(line).toBeNull()
      })

      it('should render empty chart with empty data', () => {
        chart = new cc.composites.CompositeYView({config, container})
        chart.setData([])
        chart.render()
        let svg = container.querySelector('svg')
        let children = _.map(svg.children)
        let line = container.querySelector('path.line')
        // should render composite-y, axis x, axis y
        expect(children.length).toBe(3)
        expect(line).toBeNull()
      })

      describe('Change config after render', () => {
        it('add StackedBar components', () => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Line',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          config.plot.y[2] = {
            accessor: 'c',
            chart: 'StackedBar',
            axis: 'y1'
          }
          config.axes.y1 = { position: 'right' }
          chart.setConfig(config)
          let bars = container.querySelectorAll('rect.bar')
          let line = container.querySelectorAll('path.line')
          expect(line.length).toBe(2)
          expect(bars.length).toBe(5)
        })

        it('change Line to Gtouped Bar', () => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Line',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          config.plot.y[1].chart = 'StackedBar'
          chart.setConfig(config)
          let bars = container.querySelectorAll('rect.bar')
          let line = container.querySelectorAll('path.line')
          expect(line.length).toBe(1)
          expect(bars.length).toBe(5)
        })

        it('disabled second Line', () => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Line',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          config.plot.y[1].disabled = true
          chart.setConfig(config)
          let lines = container.querySelectorAll('path.line')
          expect(lines.length).toBe(1)
        })

        it('change second Line accessor', done => {
          data = [
            { x: 0, a: 0, b: 0, c: 14 },
            { x: 1, a: 2, b: 4, c: 12 },
            { x: 2, a: 4, b: 8, c: 8 },
            { x: 3, a: 6, b: 12, c: 4 },
            { x: 4, a: 8, b: 14, c: 0 },
          ]
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Line',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          config.plot.y[1].accessor = 'c'
          chart.setConfig(config)
          let secondLine = container.querySelector('path.line-c')

          observe('attr', secondLine, 'd', () => {
            let path = secondLine.getAttribute('d')
            let lineStartPoint = getPathStartPoint(path)
            let lineEndPoint = getPathEndPoint(path)
            let clipPath = container.querySelector('clipPath rect')
            let clipWidth = clipPath.getAttribute('width')
            let clipHeight = clipPath.getAttribute('height')

            expect(lineStartPoint).toBe('0,0')
            expect(lineEndPoint).toBe(`${clipWidth},${clipHeight}`)
            done()
          })
        })

        xit('checking the default label change when the accessor changes', () => {
          config.plot.y[0].chart = 'Line'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'Line',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)
          config.plot.y[1].accessor = 'c'
          chart.setConfig(config)
          let axisY = container.querySelector('g.axis.y')
          let labels = axisY.querySelectorAll('.axis-label')
          _.each(labels, (label, i) => {
            let labelText = label.innerHTML
            expect(labelText).toBe(config.plot.y[i].accessor)
          })
        })

        it('change stackedBar color', done => {
          config.plot.y[0].chart = 'StackedBar'
          config.plot.y[1] = {
            accessor: 'b',
            chart: 'StackedBar',
          }
          chart = new cc.composites.CompositeYView({config, container})
          chart.setData(data)

          setTimeout(() => {
            config.plot.y[0].color = 'red'
            config.plot.y[1].color = 'green'
            chart.setConfig(config)
            let bars = container.querySelectorAll('rect.bar')
            observe('attr', bars[bars.length - 1], 'height', () => {
              _.each(bars, (bar, i) => {
                let barColor = bar.getAttribute('fill')
                if (i % 2) {
                  expect(barColor).toBe('rgb(0, 128, 0)')
                } else {
                  expect(barColor).toBe('rgb(255, 0, 0)')
                }
              })
              done()
            })
          }, 0)
        })
      })
    })
  })
})
