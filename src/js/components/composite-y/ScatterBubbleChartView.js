/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var XYChartSubView = require('components/composite-y/XYChartSubView')

var ScatterBubbleChartView = XYChartSubView.extend({
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
  /**
  * Shape drawing functions. The draw on the entering and edit selections. One drawing function per accessor shape.
  */
  shapeEnterFunctions: { circle: 'shapeEnterCircle' },
  shapeEditFunctions: { circle: 'shapeEditCircle' },

  shapeEnterCircle: function (d, selection) {
    var self = this
    selection.append('circle')
      .attr('class', d.className)
      .attr('cx', d.x)
      .attr('cy', d.y)
      .attr('fill', d.color)
      .attr('r', 0)
      .on('mouseover', self._onMouseover.bind(self))
      .on('mouseout', self._onMouseout.bind(self))
  },

  shapeEditCircle: function (d, selection) {
    selection.transition().ease(d3.easeLinear).duration(300)
      .attr('cx', d.x)
      .attr('cy', d.y)
      .attr('fill', d.color)
      .attr('r', d.r)
  },

  renderData: function () {
    var self = this
    var data = self.getData()
    var yScale = self.getYScale()
    var xScale = self.params.axis[self.params.plot.x.axis].scale

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
        _.bind(self[self.shapeEnterFunctions[d.shape]], self)(d, d3.select(this))
      })
    svgBubbles = self.svgSelection().select('g.drawing-' + self.getName()).selectAll('.bubble').data(flatData, function (d) { return d.id })
    svgBubbles
      .each(function (d) {
        self[self.shapeEditFunctions[d.shape]](d, d3.select(this))
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
  },

  _onMouseover: function (d) {
    if (this.config.get('tooltipEnabled')) {
      const offset = {
        left: d.x + d.r * 0.71,
        top: d.y - d.r * 0.71
      }
      this._eventObject.trigger('showTooltip', offset, d.data, d.accessor.tooltip)
    }
  },

  _onMouseout: function (d) {
    if (this.config.get('tooltipEnabled')) {
      this._eventObject.trigger('hideTooltip', d.accessor.tooltip)
    }
    d3.select(d3.event.currentTarget).classed('active', false)
  },
})

module.exports = ScatterBubbleChartView
