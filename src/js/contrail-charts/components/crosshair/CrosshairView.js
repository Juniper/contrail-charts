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

  _mouseMoveHandler: function (sourceParams, sourceConfig, mouse) {
    var self = this
    if (mouse[0] < sourceParams.xRange[0] || mouse[0] > sourceParams.xRange[1] || mouse[1] < sourceParams.yRange[1] || mouse[1] > sourceParams.yRange[0]) {
      return
    }
    var svg = self.svgSelection()
    var data = self.getData()
    var xAccessor = sourceParams.plot.x.accessor
    var xScale = sourceParams.axis[sourceParams.plot.x.axis].scale
    var xBisector = d3.bisector(function (d) {
      return d[xAccessor]
    }).right
    var xVal = xScale.invert(mouse[0])
    var indexRight = xBisector(data, xVal, 0, data.length - 1)
    var indexLeft = indexRight - 1
    if (indexLeft < 0) indexLeft = 0
    var index = indexRight
    if (Math.abs(xVal - data[indexLeft][xAccessor]) < Math.abs(xVal - data[indexRight][xAccessor])) {
      index = indexLeft
    }
    var xElemVal = data[index][xAccessor]
    var xFormat = sourceConfig.get('axis')[sourceParams.plot.x.axis].formatter
    if (!_.isFunction(xFormat)) {
      xFormat = d3.timeFormat('%H:%M')
    }
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
  },

  _bindListeners: function () {
    var self = this
    self.stopListening(self.eventObject)
    self.listenTo(self.eventObject, 'rendered:' + self.params.sourceComponent, self._bindMouseListeners)
  },

  render: function () {
    var self = this
    self.$el.addClass(self.className)
    self.resetParams()
    self._bindListeners()
  }
})

module.exports = CrosshairView
