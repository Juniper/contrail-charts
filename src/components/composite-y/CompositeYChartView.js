/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './composite-y.scss'
import _ from 'lodash'
import * as d3Ease from 'd3-ease'
import * as d3Axis from 'd3-axis'
import * as d3Array from 'd3-array'
import * as d3TimeFormat from 'd3-time-format'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import LineChartView from 'components/composite-y/LineChartView'
import AreaChartView from 'components/composite-y/AreaChartView'
import BarChartView from 'components/composite-y/GroupedBarChartView'
import StackedBarChartView from 'components/composite-y/StackedBarChartView'
import ScatterPlotView from 'components/composite-y/ScatterPlotView'
import CompositeYChartConfigModel from 'components/composite-y/CompositeYChartConfigModel'
import TitleView from 'helpers/title/TitleView'

export default class CompositeYChartView extends ContrailChartsView {
  static get dataType () { return 'DataFrame' }

  constructor (p) {
    super(p)
    this._drawings = []

    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  get tagName () { return 'g' }

  get possibleChildViews () {
    return {
      LineChart: LineChartView,
      AreaChart: AreaChartView,
      BarChart: BarChartView,
      StackedBarChart: StackedBarChartView,
      ScatterPlot: ScatterPlotView,
    }
  }

  get xMarginInner () {
    return this.config.get('marginInner') + this.params.xMarginInner
  }
  /**
   * @return {String} id of element to clip the visible area
   */
  get clip () {
    return 'rect-clipPath-' + this.id
  }

  render () {
    if (!this.config || !this._container) return
    this.resetParams()
    if (this.params.title) TitleView(this._container, this.params.title)
    this._updateChildDrawings()
    this._calculateActiveAccessorData()
    this._calculateDimensions()
    this.calculateScales()

    super.render()
    this.renderSVG()
    this.renderXAxis()
    this.renderYAxes()
    _.each(this._drawings, drawing => drawing.render())

    const crosshairId = this.config.get('crosshair')
    if (crosshairId) actionman.fire('HideComponent', crosshairId)

    this._ticking = false
  }

  remove () {
    super.remove()
    window.removeEventListener('resize', this._onResize)
    _.each(this._drawings, drawing => drawing.remove())
    this._drawings = []
  }

  showCrosshair (point) {
    const crosshairId = this.config.get('crosshair')
    const xScale = this.params.axis[this.config.get('plot.x.axis')].scale
    const mouseX = xScale.invert(point[0])
    const data = this.model.getNearest(this.config.get('plot.x.accessor'), mouseX)
    const config = this.getCrosshairConfig()
    actionman.fire('ShowComponent', crosshairId, data, point, config)

    // reset the tick so we can capture the next handler
    this._ticking = false
  }

  _calculateDimensions () {
    if (this._drawings[0]) {
      this.params.chartWidth = this._drawings[0].width
      this.params.chartHeight = this._drawings[0].height
    }
  }
  /**
  * Calculates the activeAccessorData that holds only the verified and enabled accessors from the 'plot' structure.
  * Params: activeAccessorData, yAxisInfoArray
  */
  _calculateActiveAccessorData () {
    this.params.activeAccessorData = []
    this.params.yAxisInfoArray = []
    // Initialize the drawings activeAccessorData structure
    _.each(this._drawings, drawing => {
      drawing.params.activeAccessorData = []
      drawing.params.enabled = false
    })
    // Fill the activeAccessorData structure.
    _.each(this.config.get('plot.y'), accessor => {
      const drawing = this.getDrawing(accessor)
      if (drawing) {
        if (accessor.enabled) {
          this.params.activeAccessorData.push(accessor)
          let foundAxisInfo = _.find(this.params.yAxisInfoArray, { name: accessor.axis })
          const axisPosition = this.hasAxisParam(accessor.axis, 'position') ? this.params.axis[accessor.axis].position : 'left'
          if (!foundAxisInfo) {
            foundAxisInfo = {
              name: accessor.axis,
              used: 0,
              position: axisPosition,
              num: 0,
              accessors: [],
            }
            this.params.yAxisInfoArray.push(foundAxisInfo)
          }
          foundAxisInfo.used++
          foundAxisInfo.accessors.push(accessor.accessor)
          if (accessor.chart) {
            // Set the activeAccessorData to the appropriate drawings.
            if (drawing) {
              drawing.params.activeAccessorData.push(accessor)
              drawing.params.enabled = true
            }
          }
        }
      }
    })
  }
  /**
   * Use the scales provided in the config or calculate them to fit data in view.
   * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
   * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
   */
  calculateScales () {
    const p = this.params
    p.xMarginInner = _.max(_.map(this._drawings, 'xMarginInner'))
    p.xRange = [p.marginLeft + p.marginInner + p.xMarginInner, p.chartWidth - p.marginRight - p.marginInner - p.xMarginInner]
    p.yRange = [p.chartHeight - p.marginInner - p.marginBottom, p.marginInner + p.marginTop]
    this.saveScales()
  }

  getDrawing (accessor) {
    return _.find(this._drawings, drawing => {
      return drawing.axisName === accessor.axis && drawing.type === accessor.chart
    })
  }
  /**
   * Combine series domains (extents) by axis
   */
  combineDomains () {
    const domains = {}
    _.each(this._drawings, drawing => {
      _.each(drawing.combineDomains(), (drawingDomain, axisName) => {
        domains[axisName] = d3Array.extent(_.concat(domains[axisName] || [], drawingDomain))
      })
    })
    return domains
  }
  /**
  * Save all scales in the params and drawing.params structures.
  */
  saveScales () {
    const domains = this.combineDomains()
    if (!_.has(this.params, 'axis')) {
      this.params.axis = {}
    }
    _.each(domains, (domain, axisName) => {
      if (!_.has(this.params.axis, axisName)) this.params.axis[axisName] = {}
      const axis = this.params.axis[axisName]
      axis.position = this.config.getPosition(axisName)
      axis.domain = domain
      if (!this.hasAxisParam(axisName, 'range')) {
        if (['bottom', 'top'].includes(axis.position)) {
          axis.range = this.params.xRange
        } else if (['left', 'right'].includes(axis.position)) {
          axis.range = this.params.yRange
        }
      }
      if (!_.isFunction(axis.scale) && axis.range) {
        const scale = this.config.getScale(axisName)
        if (axis.nice) {
          if (this.hasAxisParam(axisName, 'ticks')) {
            scale.nice(axis.ticks)
          } else {
            scale.nice()
          }
        }
        scale.domain(axis.domain)
          .range(axis.range)
        axis.scale = scale
      }
    })
    this.adjustAxisMargin()

    // Now update the scales of the appropriate drawings.
    _.each(this._drawings, drawing => {
      drawing.params.axis = this.params.axis
    })
  }
  /**
   * shrink x and y axes range to have margin for displaying of shapes sticking out of scale
   */
  adjustAxisMargin () {
    let sizeMargin = 0
    const sizeAxises = _.filter(this.params.axis, (axis, name) => name.match('size'))
    _.each(sizeAxises, axis => {
      // assume max shape extension out of scale range as of triangle's half edge
      // TODO margin should be based on the biggest triangle in the visible dataset but not the whole data
      const axisSizeMargin = Math.sqrt(axis.range[1] / Math.sqrt(3))
      if (axisSizeMargin > sizeMargin) sizeMargin = axisSizeMargin
    })
    if (!sizeMargin) return
    const axises = _.filter(this.params.axis, axis => axis.position && axis.range)
    _.each(axises, axis => {
      const axisMargin = ['left', 'right'].includes(axis.position) ? -sizeMargin : sizeMargin
      axis.scale.range([axis.range[0] + axisMargin, axis.range[1] - axisMargin])
    })
  }
  /**
   * Renders axis and drawing groups.
   * Resizes chart dimensions if chart already exists.
   */
  renderSVG () {
    const translate = this.params.xRange[0] - this.xMarginInner
    if (this.d3.select('clipPath').empty()) {
      this.d3.append('clipPath')
        .attr('id', this.clip)
        .append('rect')
        .attr('x', this.params.xRange[0] - this.xMarginInner)
        .attr('y', this.params.yRange[1] - this.params.marginInner)
        .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner)
        .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      this.d3.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + (this.params.yRange[1] - this.params.marginInner) + ')')
    }
    // TODO merge with previous as enter / update
    // Handle (re)size.
    this.d3
      .select('#' + this.clip).select('rect')
      .attr('x', this.params.xRange[0] - this.xMarginInner)
      .attr('y', this.params.yRange[1] - this.params.marginInner)
      .attr('width', this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner)
      .attr('height', this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)

    // Handle Y axis
    const svgYAxis = this.d3.selectAll('.axis.y-axis').data(this.params.yAxisInfoArray, d => d.name)

    // Do not remove last axis
    if (svgYAxis.nodes().length < 1) {
      const toRemove = svgYAxis.exit().nodes()
      _.each(toRemove.slice(1), node => node.remove())
    } else svgYAxis.exit().remove()

    svgYAxis.enter()
      .append('g')
      .attr('class', d => `axis y-axis ${d.name}-axis`)
      .merge(svgYAxis)
      .attr('transform', 'translate(' + translate + ',0)')

    if (this.config.has('crosshair')) {
      this.svg.delegate('mousemove', 'svg', this._onMousemove.bind(this))
    }
  }

  hasAxisConfig (axisName, axisAttributeName) {
    const axis = this.config.get('axis')
    return _.isObject(axis) && _.isObject(axis[axisName]) && !_.isUndefined(axis[axisName][axisAttributeName])
  }

  hasAxisParam (axisName, axisAttributeName) {
    return _.isObject(this.params.axis) && _.isObject(this.params.axis[axisName]) && !_.isUndefined(this.params.axis[axisName][axisAttributeName])
  }
  /**
   * Render x axis
   */
  renderXAxis () {
    const name = this.config.get('plot.x.axis')
    const axis = this.params.axis[name]
    if (!axis.scale) return

    let xAxis = d3Axis.axisBottom(axis.scale)
      .tickSize(this.params.yRange[0] - this.params.yRange[1] + 2 * this.params.marginInner)
      .tickPadding(10)
    if (this.hasAxisParam('x', 'ticks')) {
      xAxis = xAxis.ticks(axis.ticks)
    } else {
      xAxis = xAxis.ticks(this.params._xTicks)
    }
    if (this.hasAxisConfig('x', 'formatter')) {
      xAxis = xAxis.tickFormat(this.config.get('axis').x.formatter)
    }
    this.d3.transition().ease(d3Ease.easeLinear).duration(this.params.duration)
    this.d3.select('.axis.x-axis').call(xAxis)

    const labelData = []
    let labelMargin = 5
    if (this.hasAxisParam(name, 'labelMargin')) {
      labelMargin = axis.labelMargin
    }
    let label = this.params.plot.x.labelFormatter || this.params.plot.x.label
    if (this.hasAxisParam(name, 'label')) label = axis.label
    if (label) labelData.push(label)

    const axisLabelElements = this.d3.select('.axis.x-axis').selectAll('.axis-label').data(labelData)
    axisLabelElements.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(axisLabelElements)
      .attr('x', this.params.xRange[0] + (this.params.xRange[1] - this.params.xRange[0]) / 2)
      .attr('y', this.params.chartHeight - this.params.marginTop - labelMargin)
      .text(d => d)
    axisLabelElements.exit().remove()
  }

  renderYAxes () {
    // We render the yAxis here because there may be multiple drawings for one axis.
    // The parent has aggregated information about all Y axis.
    let referenceYScale = null
    let yLabelX = 0
    let yLabelTransform = 'rotate(-90)'
    _.each(this.params.yAxisInfoArray, axisInfo => {
      let yLabelMargin = this.config.get('labelMargin')
      if (this.hasAxisParam(axisInfo.name, 'labelMargin')) {
        yLabelMargin = this.params.axis[axisInfo.name].labelMargin
      }
      yLabelX = 0 - this.params.marginLeft + yLabelMargin
      yLabelTransform = 'rotate(-90)'
      if (axisInfo.position === 'right') {
        yLabelX = this.params.chartWidth - this.params.marginLeft - yLabelMargin
        yLabelTransform = 'rotate(90)'
        axisInfo.yAxis = d3Axis.axisRight(this.params.axis[axisInfo.name].scale)
          .tickSize((this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner))
          .tickPadding(5)
      } else {
        axisInfo.yAxis = d3Axis.axisLeft(this.params.axis[axisInfo.name].scale)
          .tickSize(-(this.params.xRange[1] - this.params.xRange[0] + 2 * this.xMarginInner))
          .tickPadding(5)
      }
      if (this.hasAxisParam(axisInfo.name, 'ticks')) {
        axisInfo.yAxis = axisInfo.yAxis.ticks(this.params.axis[axisInfo.name].ticks)
      }
      if (!referenceYScale) {
        referenceYScale = axisInfo.yAxis.scale()
      } else {
        // This is not the first Y axis so adjust the tick values to the first axis tick values.
        let ticks = referenceYScale.ticks(this.params._yTicks)
        if (this.hasAxisParam(axisInfo.name, 'ticks')) {
          ticks = referenceYScale.ticks(this.params.axis[axisInfo.name].ticks)
        }
        const referenceTickValues = _.map(ticks, tickValue => {
          return axisInfo.yAxis.scale().invert(referenceYScale(tickValue))
        })
        axisInfo.yAxis = axisInfo.yAxis.tickValues(referenceTickValues)
      }
      if (this.hasAxisConfig(axisInfo.name, 'formatter')) {
        axisInfo.yAxis = axisInfo.yAxis.tickFormat(this.config.get('axis')[axisInfo.name].formatter)
      }
      this.d3.select('.axis.y-axis.' + axisInfo.name + '-axis').call(axisInfo.yAxis)
      // Y axis label
      const yLabelData = []
      if (this.hasAxisConfig(axisInfo.name, 'label')) {
        yLabelData.push({label: this.config.get('axis')[axisInfo.name].label, x: yLabelX})
      } else {
        let i = 0
        // There will be one label per unique accessor label displayed on this axis.
        _.each(axisInfo.accessors, key => {
          const foundActiveAccessorData = _.find(this.params.activeAccessorData, { accessor: key })
          if (!foundActiveAccessorData) return
          const label = foundActiveAccessorData.labelFormatter || foundActiveAccessorData.label
          if (!label) return
          const foundYLabelData = _.find(yLabelData, { label: label })
          if (!foundYLabelData) {
            let yLabelXDelta = this.config.get('labelMargin') * i
            if (axisInfo.position === 'right') {
              yLabelXDelta = -yLabelXDelta
            }
            yLabelData.push({ label: label, x: yLabelX + yLabelXDelta })
            i++
          }
        })
      }
      const yAxisLabelSvg = this.d3.select(`.axis.y-axis.${axisInfo.name}-axis`)
        .selectAll('.axis-label')
        .data(yLabelData, d => d.label)
      yAxisLabelSvg.enter()
        .append('text')
        .attr('class', 'axis-label')
        .merge(yAxisLabelSvg)
        .attr('transform', d => 'translate(' + d.x + ',' + (this.params.yRange[1] + (this.params.yRange[0] - this.params.yRange[1]) / 2) + ') ' + yLabelTransform)
        .text(d => d.label)
      yAxisLabelSvg.exit().remove()
    })
  }
  // TODO move to CrosshairConfig
  getCrosshairConfig () {
    const x = this.config.get('plot').x
    const data = {
      bubbles: [],
      // Prepare crosshair bounding box
      x1: this.params.xRange[0],
      x2: this.params.xRange[1],
      y1: this.params.yRange[1],
      y2: this.params.yRange[0],
    }
    const globalXScale = this.params.axis[x.axis].scale

    // Prepare x label formatter
    data.xFormat = _.get(this.config, `attributes.axis.${x.axis}.formatter`)
    if (!_.isFunction(data.xFormat)) data.xFormat = d3TimeFormat.timeFormat('%H:%M')

    // Prepare line coordinates
    data.line = {
      x: d => globalXScale(_.get(d, x.accessor)),
      y1: this.params.yRange[0],
      y2: this.params.yRange[1],
      // Prepare x label text
      text: d => data.xFormat(_.get(d, x.accessor)),
    }
    // Prepare circle data
    _.each(this._drawings, drawing => {
      _.each(drawing.params.activeAccessorData, accessor => {
        data.bubbles.push({
          id: accessor.accessor,
          x: d => drawing.getScreenX(d, x.accessor),
          y: d => drawing.getScreenY(d, accessor.accessor),
          color: this.config.getColor([], accessor),
        })
      })
    })
    return data
  }
  /**
   * Zooming by x scale
   * Works only with components which triggers Zoom action which have the same x accessor
   * Works only with incremental values at x scale, as range is set as min / max values for x scale
   * There is no option to set zoomed range by exact position at x scale (start / end)
   */
  zoom ({accessor, range}) {
    if (this.config.get('plot.x.accessor') !== accessor) return
    _.set(this.config, 'attributes.axis.x.domain', range)
    this.config.trigger('change', this.config)
  }
  /**
  * Update the drawings array based on the plot.y.
  */
  _updateChildDrawings () {
    const plot = this.config.get('plot')
    if (!plot.x.axis) {
      // Default x axis name.
      plot.x.axis = 'x'
    }
    _.each(plot.y, accessor => {
      if (!accessor.axis) {
        // Default y axis name.
        accessor.axis = 'y'
      }
      // if accessor is not set to disabled treat it as enabled
      if (!_.has(accessor, 'enabled')) {
        accessor.enabled = true
      }
      if (accessor.chart && accessor.enabled) {
        let foundDrawing = this.getDrawing(accessor)
        if (!foundDrawing) {
          // The child drawing with this name does not exist yet. Instantiate the child drawing.
          _.each(this.possibleChildViews, (ChildView, chartType) => {
            if (chartType === accessor.chart) {
              const params = _.extend({}, this.config.attributes, {
                isPrimary: false,
                axisName: accessor.axis,
              })
              const compositeYConfig = new CompositeYChartConfigModel(params)
              foundDrawing = new ChildView({
                model: this.model,
                config: compositeYConfig,
                container: this._container,
                parent: this,
              })
              this._drawings.push(foundDrawing)
            }
          })
        }
      }
    })
    // Order the drawings so the highest order drawings get rendered first.
    this._drawings.sort((a, b) => a.renderOrder - b.renderOrder)
    _.each(this._drawings, drawing => { drawing.resetParams() })
  }

  // Event handlers
  _onConfigModelChange () {
    _.each(this._drawings, drawing => {
      drawing.config.set(this.config.attributes)
    })
    this.render()
  }

  _onMousemove (d, el, e) {
    const point = [e.offsetX, e.offsetY]
    if (!this._ticking) {
      window.requestAnimationFrame(this.showCrosshair.bind(this, point))
      this._ticking = true
    }
  }
}
