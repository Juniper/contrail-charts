/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var XYChartSubView = require('components/composite-y/XYChartSubView')

var ScatterBubbleChartView = XYChartSubView.extend({
  tagName: 'div',
  className: 'scatter-bubble-chart',
  chartType: 'scatterBubble',
  renderOrder: 50,

  /**
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevent yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] }
  */
  calculateAxisDomains: function () {
    var self = this
    var domains = {}
    domains[self.params.plot.x.axis] = self.model.getRangeFor(self.params.plot.x.accessor)
    domains[self.axisName] = []
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(self.params.activeAccessorData, function (accessor) {
      var domain = self.model.getRangeFor(accessor.accessor)
      domains[self.axisName] = domains[self.axisName].concat(domain)
      if (accessor.sizeAccessor && accessor.shape && accessor.sizeAxis) {
        if (!domains[accessor.sizeAxis]) {
          domains[accessor.sizeAxis] = []
        }
        domains[accessor.sizeAxis] = domains[accessor.sizeAxis].concat(self.model.getRangeFor(accessor.sizeAccessor))
      }
    })
    _.each(domains, function (domain, key) {
      domains[key] = d3.extent(domain)
    })
    self.params.handledAxisNames = _.keys(domains)
    return domains
  },

  /**
   * Called by the parent when all scales have been saved in this child's params.
   * Can be used by the child to perform any additional calculations.
   */
  calculateScales: function () {},

  /**
   * Called by the parent to allow the child to add some initialization code into the provided entering selection.
   */
  renderSVG: function (enteringSelection) {
    enteringSelection.append('g').attr('class', 'bubbles')
  },

  _bindMouseOverEvents: function (selection) {
    var self = this
    selection.on('mouseover', function (d) {
      // var pos = $(this).offset() // not working in jquery 3
      var offset = {
        left: d.x + d.r * 0.71,
        top: d.y - d.r * 0.71
      }
      self.eventObject.trigger('showTooltip', offset, d.data, d.accessor.tooltip)
      d3.select(this).classed('active', true)
    })
    selection.on('mouseout', function (d) {
      // var pos = $(this).offset() // not working in jquery 3
      self.eventObject.trigger('hideTooltip', d.accessor.tooltip)
      d3.select(this).classed('active', false)
    })
  },

  /**
  * Default shape drawing functions. Circle, Square and Triangle.
  * Use config.shapeEnterFunctions and config.shapeEditFunctions to define custom shape drawing functions.
  * Example: shapeEnterFunctions: { square: function (d, selection) { return selection.append('rect') ... } }
  */
  _shapeEnterCircle: function (d, selection) {
    return selection.append('circle')
      .attr('class', d.className)
      .attr('cx', d.x)
      .attr('cy', d.y)
      .attr('fill', d.color)
      .attr('r', 0)
  },

  _shapeEditCircle: function (d, selection) {
    selection.transition().ease(d3.easeLinear).duration(300)
      .attr('cx', d.x)
      .attr('cy', d.y)
      .attr('fill', d.color)
      .attr('r', d.r)
  },

  _shapeEnterSquare: function (d, selection) {
    return selection.append('rect')
      .attr('class', d.className)
      .attr('x', d.x)
      .attr('y', d.y)
      .attr('fill', d.color)
      .attr('width', 0)
      .attr('height', 0)
  },

  _shapeEditSquare: function (d, selection) {
    selection.transition().ease(d3.easeLinear).duration(300)
      .attr('x', d.x)
      .attr('y', d.y)
      .attr('fill', d.color)
      .attr('width', d.r)
      .attr('height', d.r)
  },

  _shapeEnterTriangle: function (d, selection) {
    return selection.append('path')
      .attr('class', d.className)
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(0))
      .attr('fill', d.color)
      .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
  },

  _shapeEditTriangle: function (d, selection) {
    selection.transition().ease(d3.easeLinear).duration(300)
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(d.r))
  },

  /**
  * Shape drawing functions. The draw on the entering and edit selections. One drawing function per accessor shape.
  */
  prepareShapeRenderFunctions: function () {
    var self = this
    self.shapeEnterFunctions = {
      circle: self._shapeEnterCircle,
      square: self._shapeEnterSquare,
      triangle: self._shapeEnterTriangle
    }
    self.shapeEditFunctions = {
      circle: self._shapeEditCircle,
      square: self._shapeEditSquare,
      triangle: self._shapeEditTriangle
    }
    if (self.config.has('shapeEnterFunctions')) {
      _.extend(self.shapeEnterFunctions, self.config.get('shapeEnterFunctions'))
    }
    if (self.config.has('shapeEditFunctions')) {
      _.extend(self.shapeEditFunctions, self.config.get('shapeEditFunctions'))
    }
  },

  renderData: function () {
    var self = this
    var data = self.getData()
    var yScale = self.getYScale()
    var xScale = self.params.axis[self.params.plot.x.axis].scale

    self.prepareShapeRenderFunctions()

    // Create a flat data structure
    var flatData = []
    _.each(data, function (d) {
      var x = d[self.params.plot.x.accessor]
      _.each(self.params.activeAccessorData, function (accessor) {
        var key = accessor.accessor
        var y = d[key]
        var rScale = self.params.axis[accessor.sizeAxis].scale
        var obj = {
          id: x + '-' + key,
          className: 'bubble bubble-' + key,
          selectClassName: '.bubble-' + key,
          x: xScale(x),
          y: yScale(y),
          shape: accessor.shape,
          r: rScale(d[accessor.sizeAccessor]),
          color: self.getColor(accessor),
          accessor: accessor,
          data: d
        }
        flatData.push(obj)
      })
    })
    var svgBubbles = self.svgSelection().select('g.drawing-' + self.getName()).selectAll('.bubble').data(flatData, function (d) { return d.id })
    svgBubbles.enter()
      .each(function (d, i, selection) {
        var enter = self.shapeEnterFunctions[d.shape](d, d3.select(this))
        self._bindMouseOverEvents(enter)
      })
    svgBubbles = self.svgSelection().select('g.drawing-' + self.getName()).selectAll('.bubble').data(flatData, function (d) { return d.id })
    svgBubbles
      .each(function (d) {
        self.shapeEditFunctions[d.shape](d, d3.select(this))
      })
    svgBubbles.exit().transition().ease(d3.easeLinear).duration(self.params.duration)
      .attr('r', 0)
      .remove()
  },

  render: function () {
    var self = this
    _.defer(function () {
      self.renderData()
    })
    return self
  }
})

module.exports = ScatterBubbleChartView
