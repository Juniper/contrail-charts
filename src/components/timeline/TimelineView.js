/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './timeline.scss'
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Brush from 'd3-brush'
import * as d3Shape from 'd3-shape'
import * as d3Scale from 'd3-scale'
import * as d3Axis from 'd3-axis'
import * as d3Ease from 'd3-ease'
import ContrailChartsView from 'contrail-charts-view'

export default class TimelineView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this._focusDataProvider = new DataProvider({parentDataModel: this.model})
    this.brush = null
    this._throttledTriggerWindowChangedEvent = _.throttle(this._triggerWindowChangedEvent, 100).bind(this)
    this.listenTo(this.model, 'change', this._onModelChange)
    window.addEventListener('resize', this._onModelChange.bind(this))
  }

  get tagName () { return 'g' }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this._focusDataProvider = new DataProvider({parentDataModel: this.model})
    this.listenTo(this.model, 'change', this._onModelChange)
  }

  get focusDataProvider () {
    return this._focusDataProvider
  }

  hasAxisConfig (axisName, axisAttributeName) {
    const axis = this.config.get('axis')
    return _.isObject(axis) && _.isObject(axis[axisName]) && !_.isUndefined(axis[axisName][axisAttributeName])
  }

  hasAxisParam (axisName, axisAttributeName) {
    return _.isObject(this.params.axis) &&
      _.isObject(this.params.axis[axisName]) &&
      !_.isUndefined(this.params.axis[axisName][axisAttributeName])
  }

  render () {
    this.resetParams()
    this._calculateDimensions()
    this._calculateScales()
    super.render()
    this._renderAxis()
    this._renderBar()
    this._renderBrush()
    return this
  }
  /**
  * This needs to be called after compositeYChartView is rendered because we need the params computed.
  */
  _renderBrush () {
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    if (!this.brush) {
      const brushHandleHeight = this.params.brushHandleHeight
      this.brush = d3Brush.brushX()
        .extent([
          [this.params.xRange[0], this.params.yRange[1] + 10],
          [this.params.xRange[1], this.params.yRange[0] - 10]])
        .handleSize(10)
        .on('brush', () => {
          this._handleBrushSelection(d3Selection.event.selection)
        })
        .on('end', () => {
          const dataWindow = d3Selection.event.selection
          if (!dataWindow) {
            this._removeBrush()
            this._renderBrush()
          } else {
            this._handleBrushSelection(d3Selection.event.selection)
          }
        })
      const gBrush = this.d3.append('g').classed('brush', true).call(this.brush)
      gBrush.selectAll('.handle--custom')
        .data([{type: 'w'}, {type: 'e'}])
        .enter().append('path')
        .classed('handle--custom', true)
        .classed('hide', true)
        .attr('d', d3Shape.arc()
          .innerRadius(0)
          .outerRadius(brushHandleHeight)
          .startAngle(0)
          .endAngle((d, i) => i ? Math.PI : -Math.PI))
      if (_.isArray(this.params.selection)) {
        const brushGroup = this.d3.select('g.brush').transition().ease(d3Ease.easeLinear).duration(this.params.duration)
        const xMin = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[0] / 100) + xScale.range()[0]
        const xMax = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[1] / 100) + xScale.range()[0]
        this.brush.move(brushGroup, [xMin, xMax])
      }
    }
  }

  _removeBrush () {
    this.d3.select('g.brush').remove()
    this.brush = null
    this.config.unset('focusDomain', { silent: true })
    const newFocusDomain = {}
    this._focusDataProvider.setRangeAndFilterData(newFocusDomain)
  }

  _calculateDimensions () {
    if (!this.params.chartWidth) {
      this.params.chartWidth = this._container.getBoundingClientRect().width
    }
    if (this.params.chartWidthDelta) {
      this.params.chartWidth += this.params.chartWidthDelta
    }
    if (!this.params.chartHeight) {
      this.params.chartHeight = Math.round(this.params.chartWidth / 2)
    }
  }

  _calculateScales () {
    // Calculate the starting and ending positions in pixels of the chart data drawing area.
    this.params.xRange = [this.params.marginLeft, this.params.chartWidth - this.params.marginRight]
    this.params.yRange = [this.params.chartHeight - this.params.marginBottom, this.params.marginTop]
    const domain = this.model.getRangeFor(this.params.plot.x.accessor)
    const axisName = this.params.plot.x.axis || 'x'
    if (this.hasAxisParam(axisName, 'domain')) {
      if (!_.isUndefined(this.config.get('axis')[axisName].domain[0])) {
        domain[0] = this.config.get('axis')[axisName].domain[0]
      }
      if (!_.isUndefined(this.config.get('axis')[axisName].domain[1])) {
        domain[1] = this.config.get('axis')[axisName].domain[1]
      }
    }
    this.params.axis[axisName].domain = domain
    if (!_.isFunction(this.params.axis[axisName].scale)) {
      let baseScale = null
      if (this.hasAxisConfig(axisName, 'scale') && _.isFunction(d3[this.config.get('axis')[axisName]])) {
        baseScale = d3[this.params.axis[axisName].scale]()
      } else {
        baseScale = d3Scale.scaleTime()
      }
      this.params.axis[axisName].scale = baseScale.domain(this.params.axis[axisName].domain).range(this.params.xRange)
      if (this.hasAxisParam(axisName, 'nice') && this.params.axis[axisName].nice) {
        if (this.hasAxisParam(axisName, 'ticks')) {
          this.params.axis[axisName].scale = this.params.axis[axisName].scale.nice(this.params.axis[axisName].ticks)
        } else {
          this.params.axis[axisName].scale = this.params.axis[axisName].scale.nice()
        }
      }
    }
  }

  _renderAxis () {
    const xAxisName = this.params.plot.x.axis
    let xAxis = d3Axis.axisBottom(this.params.axis[xAxisName].scale)
      .tickSize(this.params.yRange[0] - this.params.yRange[1])
      .tickPadding(10)
    if (this.hasAxisParam('x', 'ticks')) {
      xAxis = xAxis.ticks(this.params.axis[xAxisName].ticks)
    }
    if (this.hasAxisConfig('x', 'formatter')) {
      xAxis = xAxis.tickFormat(this.config.get('axis').x.formatter)
    }
    this.d3.transition().ease(d3Ease.easeLinear).duration(this.params.duration)
    this.d3.select('.axis.x-axis').call(xAxis)
    // X axis label
    const xLabelData = []
    let xLabelMargin = 5
    if (this.hasAxisParam(xAxisName, 'labelMargin')) {
      xLabelMargin = this.params.axis[xAxisName].labelMargin
    }
    let xLabel = this.params.plot.x.labelFormatter || this.params.plot.x.label
    if (this.hasAxisParam(xAxisName, 'label')) {
      xLabel = this.params.axis[xAxisName].label
    }
    if (xLabel) {
      xLabelData.push(xLabel)
    }
    const xAxisLabelSvg = this.d3.select('.axis.x-axis').selectAll('.axis-label').data(xLabelData)
    xAxisLabelSvg.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(xAxisLabelSvg)
      .attr('x', this.params.xRange[0] + (this.params.xRange[1] - this.params.xRange[0]) / 2)
      .attr('y', this.params.chartHeight - this.params.marginTop - xLabelMargin)
      .text((d) => d)
    xAxisLabelSvg.exit().remove()
  }

  _renderBar () {
    const axisName = this.params.plot.x.axis
    const xScale = this.params.axis[axisName].scale
    const barHeight = this.params.brushHandleHeight
    const barTop = this.params.yRange[1] - (barHeight / 2) + (this.params.yRange[0] - this.params.yRange[1]) / 2
    const svgBars = this.d3.selectAll('.timeline-bar').data([{ c: barTop, h: barHeight }])
    svgBars.enter().append('rect')
      .attr('class', 'timeline-bar')
      .attr('x', xScale.range()[0])
      .attr('y', barTop + barHeight / 2)
      .attr('width', xScale.range()[1] - xScale.range()[0])
      .attr('height', 1)
      .merge(svgBars).transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      .attr('x', xScale.range()[0])
      .attr('y', (d) => d.c)
      .attr('width', xScale.range()[1] - xScale.range()[0])
      .attr('height', (d) => d.h)
    svgBars.exit().remove()
  }

  _triggerWindowChangedEvent (focusDomain) {
    const x = this.params.plot.x.accessor
    this._focusDataProvider.setRangeAndFilterData(focusDomain)
    this._eventObject.trigger('windowChanged', focusDomain[x][0], focusDomain[x][1])
  }

  // Event handlers

  _handleBrushSelection (dataWindow) {
    const x = this.params.plot.x.accessor
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    const brushHandleScaleX = this.params.brushHandleScaleX
    const brushHandleScaleY = this.params.brushHandleScaleY
    const brushHandleCenter = this.params.yRange[1] + (this.params.yRange[0] - this.params.yRange[1]) / 2
    let xMin = xScale.invert(dataWindow[0])
    let xMax = xScale.invert(dataWindow[1])
    if (_.isDate(xMin)) {
      xMin = xMin.getTime()
    }
    if (_.isDate(xMax)) {
      xMax = xMax.getTime()
    }
    const focusDomain = {}
    focusDomain[x] = [xMin, xMax]
    this.config.set({ focusDomain: focusDomain }, { silent: true })
    this._throttledTriggerWindowChangedEvent(focusDomain)
    const gHandles = this.d3.select('g.brush').selectAll('.handle--custom')
    gHandles
      .classed('hide', false)
      .attr('transform', (d, i) => 'translate(' + dataWindow[i] + ',' + brushHandleCenter + ') scale(' + brushHandleScaleX + ',' + brushHandleScaleY + ')')
  }

  _onModelChange () {
    this.render()
    this._handleModelChange()
  }

  _handleModelChange () {
    const xScale = this.params.axis[this.params.plot.x.axis].scale
    if (this.brush) {
      this.brush = this.brush.extent([
          [this.params.xRange[0], this.params.yRange[1] + 10],
          [this.params.xRange[1], this.params.yRange[0] - 10]])
      this.d3.select('g.brush').call(this.brush)
    }
    if (_.isArray(this.params.selection)) {
      if (!this.params.selection[0]) {
        this.params.selection[0] = 0
      }
      if (!this.params.selection[1]) {
        this.params.selection[1] = 100
      }
      const brushGroup = this.d3.select('g.brush').transition().ease(d3Ease.easeLinear).duration(this.params.duration)
      const xMin = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[0] / 100) + xScale.range()[0]
      const xMax = (xScale.range()[1] - xScale.range()[0]) * (this.params.selection[1] / 100) + xScale.range()[0]
      this.brush.move(brushGroup, [xMin, xMax])
    }
  }
}
