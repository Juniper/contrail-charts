/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var CrosshairView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-crosshair-view',

  initialize: function (options) {
    var self = this
    self.show = 0
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  _findXDataValue: function (mouseX, xAccessor) {
    var self = this
    var data = self.getData()
    var xBisector = d3.bisector(function (d) {
      return d[xAccessor]
    }).right
    var indexRight = xBisector(data, mouseX, 0, data.length - 1)
    var indexLeft = indexRight - 1
    if (indexLeft < 0) indexLeft = 0
    var index = indexRight
    if (Math.abs(mouseX - data[indexLeft][xAccessor]) < Math.abs(mouseX - data[indexRight][xAccessor])) {
      index = indexLeft
    }
    return data[index][xAccessor]
  },

  _mouseMoveHandler: function (sourceParams, sourceConfig, mouse) {
    var self = this
    if (!self.getData().length) {
      return self.removeCrosshair()
    }
    if (mouse[0] < sourceParams.xRange[0] || mouse[0] > sourceParams.xRange[1] || mouse[1] < sourceParams.yRange[1] || mouse[1] > sourceParams.yRange[0]) {
      return self.removeCrosshair()
    }
    var svg = self.svgSelection()
    var xScale = sourceParams.axis[sourceParams.plot.x.axis].scale
    var xElemVal = self._findXDataValue(xScale.invert(mouse[0]), sourceParams.plot.x.accessor)
    var xFormat = sourceConfig.get('axis')[sourceParams.plot.x.axis].formatter
    if (!_.isFunction(xFormat)) {
      xFormat = d3.timeFormat('%H:%M')
    }
    // Draw crosshair
    var svgCrosshair = svg.selectAll('.crosshair').data([{ x: mouse[0], y: mouse[1] }])
    var svgCrosshairEnter = svgCrosshair.enter().append('g')
      .attr('class', 'crosshair')
    svgCrosshairEnter.append('line')
      .attr('class', 'x-line')
      .attr('x1', function (d) { return d.x })
      .attr('x2', function (d) { return d.x })
      .attr('y1', (sourceParams.yRange[0] - sourceParams.yRange[1]) / 2)
      .attr('y2', (sourceParams.yRange[0] - sourceParams.yRange[1]) / 2)
    svgCrosshairEnter.append('text')
      .attr('class', 'x-text')
      .attr('x', function (d) { return d.x })
      .attr('y', sourceParams.yRange[0] + 15)
      .text(xFormat(xElemVal))
    var svgCrosshairEdit = svgCrosshairEnter.merge(svgCrosshair)
      .transition().ease(d3.easeLinear).duration(self.params.duration)
    svgCrosshairEdit.select('.x-line')
      .attr('x1', Math.round(xScale(xElemVal)))
      .attr('x2', Math.round(xScale(xElemVal)))
      .attr('y1', sourceParams.yRange[0])
      .attr('y2', sourceParams.yRange[1])
    svgCrosshairEdit.select('.x-text')
      .attr('x', xScale(xElemVal))
      .attr('y', sourceParams.yRange[0] + 15)
      .text(xFormat(xElemVal))
    svgCrosshair.exit().remove()
  },

  _bindMouseListeners: function (sourceParams, sourceConfig) {
    var self = this
    var svg = self.svgSelection()
    var throttledMouseMoveHandler = _.throttle(_.bind(self._mouseMoveHandler, self), 100)
    svg.on('mousemove', function () {
      throttledMouseMoveHandler(sourceParams, sourceConfig, d3.mouse(this))
    })
    svg.on('mouseout', function () {
      // The mouse could have left the svg but entered an svg child.
      // We still get a mouseout event in this case so still need to verify if mouse coordinates are out of bounds.
      var mouse = d3.mouse(this)
      if (mouse[0] < sourceParams.xRange[0] || mouse[0] > sourceParams.xRange[1] || mouse[1] < sourceParams.yRange[1] || mouse[1] > sourceParams.yRange[0]) {
        self.removeCrosshair()
      }
    })
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self.eventObject)
    // We assume that when the sourceComponent is rendered it triggers the 'rendered:[componentName]' event passing (sourceParams, sourceConfig) as arguments.
    // We assume that these are the params of a CompositeY chart.
    // TODO: How to handle params from different components (ie. Radial)?
    // They can have a different structure then the 'plot' and 'axis' config attributes in CompositeY.
    self.listenTo(self.eventObject, 'rendered:' + self.params.sourceComponent, self._bindMouseListeners)
  },

  removeCrosshair: function () {
    var self = this
    var svg = self.svgSelection()
    var svgCrosshair = svg.selectAll('.crosshair').data([])
    svgCrosshair.exit().remove()
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = CrosshairView
