/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsView = require('contrail-charts-view')
var DataProvider = require('handlers/DataProvider')
var CompositeYChartView = require('components/composite-y/CompositeYChartView')

var NavigationView = ContrailChartsView.extend({
  type: 'navigation',
  tagName: 'div',
  className: 'navigation-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self._focusDataProvider = new DataProvider({parentDataModel: self.model})
    self._isModelChanged = false
    self.brush = null
    self.compositeYChartView = null
    self.throttledTriggerWindowChangedEvent = _.bind(_.throttle(self._triggerWindowChangedEvent, 100), self)
    $(window).resize(function () {
      // Change the model change flag so that when the underlying chart rendered event fires the brush will be re-computed.
      self._isModelChanged = true
      if (self.brush) {
        var marginInner = self.params.marginInner
        self.brush = self.brush.extent([
            [self.params.xRange[0] - marginInner, self.params.yRange[1] - marginInner],
            [self.params.xRange[1] + marginInner, self.params.yRange[0] + marginInner]])
        self.svgSelection().select('g.brush').call(self.brush)
      }
    })
  },

  changeModel: function (model) {
    var self = this
    self.stopListening(self.model)
    self.model = model
    self._focusDataProvider = new DataProvider({parentDataModel: self.model})
    self.listenTo(self.model, 'change', self._onModelChange)
  },

  events: {
    'click .prev>a': 'prevChunkSelected',
    'click .next>a': 'nextChunkSelected'
  },

  _onModelChange: function () {
    this._isModelChanged = true
  },

  _handleModelChange: function () {
    var self = this
    var x = self.params.plot.x.accessor
    var xScale = self.params.axis[self.params.plot.x.axis].scale
    var rangeX = self.model.getRangeFor(x)
    // Fetch the previous data window position
    var prevWindowXMin
    var prevWindowXMax
    var prevWindowSize
    if (self.config.has('focusDomain')) {
      var prevFocusDomain = self.config.get('focusDomain')
      if (_.isArray(prevFocusDomain[x])) {
        prevWindowXMin = prevFocusDomain[x][0]
        prevWindowXMax = prevFocusDomain[x][1]
        prevWindowSize = prevWindowXMax - prevWindowXMin
      }
    }
    // Try to keep the same data window. Move it if exceeds data range.
    if (!_.isUndefined(prevWindowXMin) && !_.isUndefined(prevWindowXMax)) {
      var xMin = prevWindowXMin
      var xMax = prevWindowXMax
      if (xMin < rangeX[0]) {
        xMin = rangeX[0]
      }
      if (xMin > rangeX[1] - prevWindowSize) {
        xMin = rangeX[1] - prevWindowSize
      }
      if (xMax > rangeX[1]) {
        xMax = rangeX[1]
      }
      if (xMax < rangeX[0] + prevWindowSize) {
        xMax = rangeX[0] + prevWindowSize
      }
      var newFocusDomain = {}
      newFocusDomain[x] = [xMin, xMax]
      // if (xMin !== prevWindowXMin || xMax !== prevWindowXMax) {
      self._focusDataProvider.setRangeAndFilterData(newFocusDomain)
      self.config.set({ focusDomain: newFocusDomain }, { silent: true })
      // }
      var brushGroup = self.svgSelection().select('g.brush').transition().ease(d3.easeLinear).duration(self.params.duration)
      self.brush.move(brushGroup, [xScale(xMin), xScale(xMax)])
    } else {
      self.removeBrush()
    }
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

  prevChunkSelected: function () {
    var range = this.model.getRange()
    var x = this.params.xAccessor
    var rangeDiff = range[x][1] - range[x][0]
    var queryLimit = {}
    queryLimit[x] = [range[x][0] - rangeDiff * 0.5, range[x][1] - rangeDiff * 0.5]
    this.model.setQueryLimit(queryLimit)
  // TODO: show some waiting screen?
  },

  nextChunkSelected: function () {
    var range = this.model.getRange()
    var x = this.params.xAccessor
    var rangeDiff = range[x][1] - range[x][0]
    var queryLimit = {}
    queryLimit[x] = [range[x][0] + rangeDiff * 0.5, range[x][1] + rangeDiff * 0.5]
    this.model.setQueryLimit(queryLimit)
  // TODO: show some waiting screen?
  },

  getFocusDataProvider: function () {
    return this._focusDataProvider
  },

  initializeAndRenderCompositeYChartView: function () {
    var self = this
    self.compositeYChartView = new CompositeYChartView({
      model: self.model,
      config: self.config,
      el: self.el,
      id: self.id,
      eventObject: self._eventObject,
      name: 'xyChartNavigation'
    })
    self.listenTo(self._eventObject, 'rendered:xyChartNavigation', self._chartRendered)
    self.compositeYChartView.render()
  },

  /**
  * This method will be called when the underlying chart is rendered.
  */
  _chartRendered: function () {
    var self = this
    self.params = self.compositeYChartView.params
    if (self._isModelChanged) {
      self._handleModelChange()
      self._isModelChanged = false
    }
    setTimeout(function () {
      self.renderBrush()
    }, 1000)

  // self.renderPageLinks()
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
    var brushHandleCenter = (self.params.yRange[0] - self.params.yRange[1] + 2 * self.params.marginInner) / 2
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
      .attr('transform', function (d, i) { return 'translate(' + dataWindow[i] + ',' + brushHandleCenter + ') scale(1,2)' })
  },

  /**
  * This needs to be called after compositeYChartView is rendered because we need the params computed.
  */
  renderBrush: function () {
    var self = this
    var xScale = self.params.axis[self.params.plot.x.axis].scale
    var svg = self.svgSelection()
    if (!self.brush) {
      var marginInner = self.params.marginInner
      var brushHandleHeight = 16 // self.params.yRange[0] - self.params.yRange[1]
      self.brush = d3.brushX()
        .extent([
          [self.params.xRange[0] - marginInner, self.params.yRange[1] - marginInner],
          [self.params.xRange[1] + marginInner, self.params.yRange[0] + marginInner]])
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
          .outerRadius(brushHandleHeight / 2)
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

  renderPageLinks: function () {
    var self = this
    if (!self.$el.find('.page-links').length) {
      $('<div>').appendTo(self.$el).addClass('page-links')
    }
    self.$el.find('.page-links').html(self.template())
  },

  render: function () {
    var self = this
    self.resetParams()
    if (!self.compositeYChartView) {
      // One time compositeYChartView initialization.
      self.initializeAndRenderCompositeYChartView()
    // From this moment the compositeYChartView is independent from NavigationView. It will react to config / model changes on it's own.
    }
    return self
  }
})

module.exports = NavigationView
