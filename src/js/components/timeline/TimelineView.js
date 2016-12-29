/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')
var DataProvider = require('handlers/DataProvider')
var CompositeYChartView = require('components/composite-y/CompositeYChartView')

var TimelineView = ContrailChartsView.extend({
  type: 'timeline',
  tagName: 'div',
  className: 'timeline-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self._focusDataProvider = new DataProvider({parentDataModel: self.model})
    self.brush = null
    self.throttledTriggerWindowChangedEvent = _.bind(_.throttle(self._triggerWindowChangedEvent, 100), self)
    $(window).resize(function () {
      self.render()
      self._handleModelChange()
    })
  },

  changeModel: function (model) {
    var self = this
    self.stopListening(self.model)
    self.model = model
    self._focusDataProvider = new DataProvider({parentDataModel: self.model})
    self.listenTo(self.model, 'change', self._onModelChange)
  },

  _onModelChange: function () {
    this.render()
    this._handleModelChange()
  },

  _handleModelChange: function () {
    var self = this
    var xScale = self.params.axis[self.params.plot.x.axis].scale
    if (self.brush) {
      self.brush = self.brush.extent([
          [self.params.xRange[0], self.params.yRange[1] + 10],
          [self.params.xRange[1], self.params.yRange[0] - 10]])
      self.svgSelection().select('g.brush').call(self.brush)
    }
    if (_.isArray(self.params.selection)) {
      if (!self.params.selection[0]) {
        self.params.selection[0] = 0
      }
      if (!self.params.selection[1]) {
        self.params.selection[1] = 100
      }
      var brushGroup = self.svgSelection().select('g.brush').transition().ease(d3.easeLinear).duration(self.params.duration)
      var xMin = (xScale.range()[1] - xScale.range()[0]) * (self.params.selection[0] / 100) + xScale.range()[0]
      var xMax = (xScale.range()[1] - xScale.range()[0]) * (self.params.selection[1] / 100) + xScale.range()[0]
      self.brush.move(brushGroup, [xMin, xMax])
    }
  },

  getFocusDataProvider: function () {
    return this._focusDataProvider
  },

  removeBrush: function () {
    var self = this
    var svg = self.svgSelection()
    svg.select('g.brush').remove()
    self.brush = null
    self.config.unset('focusDomain', { silent: true })
    var newFocusDomain = {}
    self._focusDataProvider.setRangeAndFilterData(newFocusDomain)
  },

  getFocusDataProvider: function () {
    return this._focusDataProvider
  },

  _triggerWindowChangedEvent: function (focusDomain) {
    var self = this
    var x = self.params.plot.x.accessor
    self._focusDataProvider.setRangeAndFilterData(focusDomain)
    self._eventObject.trigger('windowChanged', focusDomain[x][0], focusDomain[x][1])
  },

  _handleBrushSelection: function (dataWindow) {
    var self = this
    var x = self.params.plot.x.accessor
    var xScale = self.params.axis[self.params.plot.x.axis].scale
    var brushHandleHeight = self.params.brushHandleHeight
    var brushHandleScaleX = self.params.brushHandleScaleX
    var brushHandleScaleY = self.params.brushHandleScaleY
    var brushHandleCenter = self.params.yRange[1] + (self.params.yRange[0] - self.params.yRange[1]) / 2
    var svg = self.svgSelection()
    var xMin = xScale.invert(dataWindow[0])
    var xMax = xScale.invert(dataWindow[1])
    if (_.isDate(xMin)) {
      xMin = xMin.getTime()
    }
    if (_.isDate(xMax)) {
      xMax = xMax.getTime()
    }
    var focusDomain = {}
    focusDomain[x] = [xMin, xMax]
    self.config.set({ focusDomain: focusDomain }, { silent: true })
    self.throttledTriggerWindowChangedEvent(focusDomain)
    var gHandles = svg.select('g.brush').selectAll('.handle--custom')
    gHandles
      .classed('hide', false)
      .attr('transform', function (d, i) { return 'translate(' + dataWindow[i] + ',' + brushHandleCenter + ') scale(' + brushHandleScaleX + ',' + brushHandleScaleY + ')' })
  },

  hasAxisConfig: function (axisName, axisAttributeName) {
    var self = this
    var axis = self.config.get('axis')
    return _.isObject(axis) && _.isObject(axis[axisName]) && !_.isUndefined(axis[axisName][axisAttributeName])
  },

  hasAxisParam: function (axisName, axisAttributeName) {
    var self = this
    return _.isObject(self.params.axis) && _.isObject(self.params.axis[axisName]) && !_.isUndefined(self.params.axis[axisName][axisAttributeName])
  },

  /**
  * This needs to be called after compositeYChartView is rendered because we need the params computed.
  */
  renderBrush: function () {
    var self = this
    var xScale = self.params.axis[self.params.plot.x.axis].scale
    var svg = self.svgSelection()
    if (!self.brush) {
      var brushHandleHeight = self.params.brushHandleHeight
      self.brush = d3.brushX()
        .extent([
          [self.params.xRange[0], self.params.yRange[1] + 10],
          [self.params.xRange[1], self.params.yRange[0] - 10]])
        .handleSize(10)
        .on('brush', function () {
          self._handleBrushSelection(d3.event.selection)
        })
        .on('end', function () {
          var dataWindow = d3.event.selection
          if (!dataWindow) {
            self.removeBrush()
            self.renderBrush()
          } else {
            self._handleBrushSelection(d3.event.selection)
          }
        })
      var gBrush = svg.append('g').attr('class', 'brush').call(self.brush)
      gBrush.selectAll('.handle--custom')
        .data([{type: 'w'}, {type: 'e'}])
        .enter().append('path')
        .attr('class', 'handle--custom hide')
        .attr('fill', '#666')
        .attr('fill-opacity', 0.75)
        .attr('stroke', '#444')
        .attr('stroke-width', 1)
        .attr('cursor', 'ew-resize')
        .attr('d', d3.arc()
          .innerRadius(0)
          .outerRadius(brushHandleHeight)
          .startAngle(0)
          .endAngle(function (d, i) { return i ? Math.PI : -Math.PI }))
      if (_.isArray(self.params.selection)) {
        if (!self.params.selection[0]) {
          self.params.selection[0] = 0
        }
        if (!self.params.selection[1]) {
          self.params.selection[1] = 100
        }
        var brushGroup = self.svgSelection().select('g.brush').transition().ease(d3.easeLinear).duration(self.params.duration)
        var xMin = (xScale.range()[1] - xScale.range()[0]) * (self.params.selection[0] / 100) + xScale.range()[0]
        var xMax = (xScale.range()[1] - xScale.range()[0]) * (self.params.selection[1] / 100) + xScale.range()[0]
        self.brush.move(brushGroup, [xMin, xMax])
      }
    }
  },

  calculateDimmensions: function () {
    var self = this
    if (!self.params.chartWidth) {
      self.params.chartWidth = self.$el.width()
    }
    if (self.params.chartWidthDelta) {
      self.params.chartWidth += self.params.chartWidthDelta
    }
    if (!self.params.chartHeight) {
      self.params.chartHeight = Math.round(self.params.chartWidth / 2)
    }
    if (!self.params.margin) {
      self.params.margin = 5
    }
    var sides = ['Top', 'Right', 'Bottom', 'Left']
    _.each(sides, function (side) {
      if (!self.params['margin' + side]) {
        self.params['margin' + side] = self.params.margin
      }
    })
  },

  calculateScales: function () {
    var self = this
    // Calculate the starting and ending positions in pixels of the chart data drawing area.
    self.params.xRange = [self.params.marginLeft, self.params.chartWidth - self.params.marginRight]
    self.params.yRange = [self.params.chartHeight - self.params.marginBottom, self.params.marginTop]
    var domain = self.model.getRangeFor(self.params.plot.x.accessor)
    var axisName = self.params.plot.x.axis || 'x'
    if (self.hasAxisParam(axisName, 'domain')) {
      if (!_.isUndefined(self.config.get('axis')[axisName].domain[0])) {
        domain[0] = self.config.get('axis')[axisName].domain[0]
      }
      if (!_.isUndefined(self.config.get('axis')[axisName].domain[1])) {
        domain[1] = self.config.get('axis')[axisName].domain[1]
      }
    }
    self.params.axis[axisName].domain = domain
    if (!_.isFunction(self.params.axis[axisName].scale)) {
      var baseScale = null
      if (self.hasAxisConfig(axisName, 'scale') && _.isFunction(d3[self.config.get('axis')[axisName]])) {
        baseScale = d3[self.params.axis[axisName].scale]()
      } else {
        baseScale = d3.scaleTime()
      }
      self.params.axis[axisName].scale = baseScale.domain(self.params.axis[axisName].domain).range(self.params.xRange)
      if (self.hasAxisParam(axisName, 'nice') && self.params.axis[axisName].nice) {
        if (self.hasAxisParam(axisName, 'ticks')) {
          self.params.axis[axisName].scale = self.params.axis[axisName].scale.nice(self.params.axis[axisName].ticks)
        } else {
          self.params.axis[axisName].scale = self.params.axis[axisName].scale.nice()
        }
      }
    }
  },

  renderSVG: function () {
    var self = this
    var svgs = d3.select(self.el).select('svg')
    if (svgs.empty()) {
      var svg = d3.select(self.el).append('svg').attr('class', 'coCharts-svg')
      svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + self.params.yRange[1] + ')')
    }
    // Handle (re)size.
    self.svgSelection()
      .attr('width', self.params.chartWidth)
      .attr('height', self.params.chartHeight)
  },

  renderAxis: function () {
    var self = this
    var xAxisName = self.params.plot.x.axis
    var xAxis = d3.axisBottom(self.params.axis[xAxisName].scale)
      .tickSize(self.params.yRange[0] - self.params.yRange[1])
      .tickPadding(10)
    if (self.hasAxisParam('x', 'ticks')) {
      xAxis = xAxis.ticks(self.params.axis[xAxisName].ticks)
    }
    if (self.hasAxisConfig('x', 'formatter')) {
      xAxis = xAxis.tickFormat(self.config.get('axis').x.formatter)
    }
    var svg = self.svgSelection().transition().ease(d3.easeLinear).duration(self.params.duration)
    svg.select('.axis.x-axis').call(xAxis)
    // X axis label
    var xLabelData = []
    var xLabelMargin = 5
    if (self.hasAxisParam(xAxisName, 'labelMargin')) {
      xLabelMargin = self.params.axis[xAxisName].labelMargin
    }
    var xLabel = self.params.plot.x.labelFormatter || self.params.plot.x.label
    if (self.hasAxisParam(xAxisName, 'label')) {
      xLabel = self.params.axis[xAxisName].label
    }
    if (xLabel) {
      xLabelData.push(xLabel)
    }
    var xAxisLabelSvg = self.svgSelection().select('.axis.x-axis').selectAll('.axis-label').data(xLabelData)
    xAxisLabelSvg.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(xAxisLabelSvg) // .transition().ease( d3.easeLinear ).duration( self.params.duration )
      .attr('x', self.params.xRange[0] + (self.params.xRange[1] - self.params.xRange[0]) / 2)
      .attr('y', self.params.chartHeight - self.params.marginTop - xLabelMargin)
      .text(function (d) { return d })
    xAxisLabelSvg.exit().remove()
  },

  renderBar: function() {
    var self = this
    var axisName = self.params.plot.x.axis
    var xScale = self.params.axis[axisName].scale
    var barHeight = self.params.brushHandleHeight
    var barTop = self.params.yRange[1] - (barHeight / 2) + (self.params.yRange[0] - self.params.yRange[1]) / 2
    var svg = self.svgSelection()
    var svgBars = svg.selectAll('.timeline-bar').data([{ c: barTop, h: barHeight }])
    svgBars.enter().append('rect')
      .attr('class', 'timeline-bar')
      .attr('x', xScale.range()[0])
      .attr('y', barTop + barHeight / 2)
      .attr('width', xScale.range()[1] - xScale.range()[0])
      .attr('height', 1)
      .merge(svgBars).transition().ease(d3.easeLinear).duration(self.params.duration)
      .attr('x', xScale.range()[0])
      .attr('y', function(d) { return d.c })
      .attr('width', xScale.range()[1] - xScale.range()[0])
      .attr('height', function(d) { return d.h })
    svgBars.exit().remove()
  },

  render: function () {
    var self = this
    self.resetParams()
    self.calculateDimmensions()
    self.calculateScales()
    self.renderSVG()
    self.renderAxis()
    self.renderBar()
    self.renderBrush()
    return self
  }
})

module.exports = TimelineView
