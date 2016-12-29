/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsView = require('contrail-charts-view')

var CrosshairView = ContrailChartsView.extend({
  type: 'crosshair',
  tagName: 'div',
  className: 'coCharts-crosshair-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self.show = 0
    self.listenTo(self.config, 'change', self.render)
  },

  _mouseMoveHandler: function (mouse) {
    var self = this
    var data = self.getData()
    var renderInfo = self.params.renderInfo
    if (!data.length) {
      return self.removeCrosshair()
    }
    if (mouse[0] < renderInfo.x1 || mouse[0] > renderInfo.x2 || mouse[1] < renderInfo.y1 || mouse[1] > renderInfo.y2) {
      return self.removeCrosshair()
    }
    var svg = self.svgSelection()
    var xElem = self.config.get('findDataElem')(mouse[0], data, self.params.sourceComponentView)
    // Draw crosshair line
    var svgCrosshair = svg.selectAll('.crosshair').data([renderInfo.line])
    var svgCrosshairEnter = svgCrosshair.enter().append('g')
      .attr('class', 'crosshair')
    svgCrosshairEnter.append('line')
      .attr('class', 'x-line')
      .attr('x1', function (d) { return d.x(xElem) })
      .attr('x2', function (d) { return d.x(xElem) })
      .attr('y1', function (d) { return d.y1 })
      .attr('y2', function (d) { return d.y2 })
    svgCrosshairEnter.append('text')
      .attr('class', 'x-text')
      .attr('x', function (d) { return d.x(xElem) })
      .attr('y', function (d) { return d.y1 + 15 })
      .text(function (d) { return d.text(xElem) })
    svgCrosshairEnter.append('g')
      .attr('class', 'bubbles')
    var svgCrosshairEdit = svgCrosshairEnter.merge(svgCrosshair)
      .transition().ease(d3.easeLinear).duration(self.params.duration)
    svgCrosshairEdit.select('.x-line')
      .attr('x1', function (d) { return d.x(xElem) })
      .attr('x2', function (d) { return d.x(xElem) })
      .attr('y1', function (d) { return d.y1 })
      .attr('y2', function (d) { return d.y2 })
    svgCrosshairEdit.select('.x-text')
      .attr('x', function (d) { return d.x(xElem) })
      .attr('y', function (d) { return d.y1 + 15 })
      .text(function (d) { return d.text(xElem) })
    // Draw bubbles for all enabled y accessors.
    var svgBubbles = svg.select('.crosshair').select('.bubbles').selectAll('circle').data(renderInfo.circles, function (d) { return d.id })
    svgBubbles.enter().append('circle')
      .attr('cx', function (d) { return d.x(xElem) })
      .attr('cy', function (d) { return d.y(xElem) })
      .attr('fill', function (d) { return d.color })
      .attr('r', 0)
      .merge(svgBubbles)
      .transition().ease(d3.easeLinear).duration(self.params.duration)
      .attr('cx', function (d) { return d.x(xElem) })
      .attr('cy', function (d) { return d.y(xElem) })
      .attr('r', self.params.bubbleR)
    svgCrosshair.exit().remove()
    if (self.params.tooltip) {
      // Show tooltip
      var pos = self.$el.offset()
      var tooltipOffset = {
        left: mouse[0] + pos.left + 30,
        top: mouse[1] + pos.top + 30
      }
      self._eventObject.trigger('showTooltip', tooltipOffset, xElem, self.params.tooltip)
    }
  },

  _prepareRenderInfo: function (componentView) {
    var self = this
    var prepareRenderInfo = this.config.get('prepareRenderInfo')
    self.params.renderInfo = prepareRenderInfo(componentView)
  },

  _bindMouseListeners: function (sourceParams, sourceConfig, componentView) {
    var self = this
    var svg = self.svgSelection()
    self._prepareRenderInfo(componentView)
    self.params.sourceComponentView = componentView
    var throttledMouseMoveHandler = _.throttle(_.bind(self._mouseMoveHandler, self), 100)
    svg.on('mousemove', function () {
      throttledMouseMoveHandler(d3.mouse(this))
    })
    svg.on('mouseout', function () {
      // The mouse could have left the svg but entered an svg child.
      // We still get a mouseout event in this case so still need to verify if mouse coordinates are out of bounds.
      var mouse = d3.mouse(this)
      if (mouse[0] < self.params.renderInfo.x1 || mouse[0] > self.params.renderInfo.x2 || mouse[1] < self.params.renderInfo.y1 || mouse[1] > self.params.renderInfo.y2) {
        self.removeCrosshair()
      }
    })
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self._eventObject)
    // We assume that when the sourceComponent is rendered it triggers the 'rendered:[componentName]' event passing (sourceParams, sourceConfig) as arguments.
    // We assume that these are the params of a CompositeY chart.
    // TODO: How to handle params from different components (ie. Radial)?
    // They can have a different structure then the 'plot' and 'axis' config attributes in CompositeY.
    self.listenTo(self._eventObject, 'rendered:' + self.params.sourceComponent, self._bindMouseListeners)
  },

  removeCrosshair: function () {
    var self = this
    var svg = self.svgSelection()
    var svgCrosshair = svg.selectAll('.crosshair').data([])
    svgCrosshair.exit().remove()
    if (self.params.tooltip) {
      // Hide tooltip
      self._eventObject.trigger('hideTooltip', self.params.tooltip)
    }
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = CrosshairView
