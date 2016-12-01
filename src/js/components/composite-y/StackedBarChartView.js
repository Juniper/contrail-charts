/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var XYChartSubView = require('components/composite-y/XYChartSubView')

var StackedBarChartView = XYChartSubView.extend({
  tagName: 'div',
  className: 'bar-chart',
  chartType: 'stackedBar',
  renderOrder: 100,

  /**
  * Called by the parent in order to calculate maximum data extents for all of this child's axis.
  * Assumes the params.activeAccessorData for this child view is filled by the parent with the relevent yAccessors for this child only.
  * Returns an object with following structure: { y1: [0,10], x: [-10,10] } - axisName: axisDomain
  */
  calculateAxisDomains: function () {
    var self = this
    var domains = {}
    domains[self.params.plot.x.axis] = self.model.getRangeFor(self.params.plot.x.accessor)
    // The domains calculated here can be overriden in the axis configuration.
    // The overrides are handled by the parent.
    _.each(self.params.activeAccessorData, function (accessor) {
      var domain = self.model.getRangeFor(accessor.accessor)
      if (_.has(domains, self.axisName)) {
        // domains[self.axisName][0] = Math.min( domain[0], domains[self.axisName][0] )
        domains[self.axisName][1] += domain[1]
      } else {
        // domains[self.axisName] = [domain[0], domain[1]]
        domains[self.axisName] = [0, domain[1]]
      }
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
  renderSVG: function (enteringSelection) {},

  renderData: function () {
    var self = this
    var data = self.getData()
    var yScale = self.getYScale()
    var xScale = self.getXScale()

    // Create a flat data structure
    var flatData = []
    var xValues = _.map(self.getData(), self.params.plot.x.accessor)
    var xValuesExtent = d3.extent(xValues)
    var xRange = [xScale(xValuesExtent[0]), xScale(xValuesExtent[1])]
    var len = data.length - 1
    if (len === 0) {
      len = 1
    }
    var bandWidth = (0.95 * ((xRange[1] - xRange[0]) / len) - 1)
    var bandWidthHalf = (bandWidth / 2)
    _.each(data, function (d) {
      var x = d[self.params.plot.x.accessor]
      var stackedY = yScale.domain()[0]
      _.each(self.params.activeAccessorData, function (accessor) {
        var key = accessor.accessor
        var obj = {
          id: x + '-' + key,
          className: 'bar bar-' + key,
          x: xScale(x) - bandWidthHalf,
          y: yScale(stackedY + d[key]),
          h: yScale.range()[0] - yScale(d[key]),
          w: bandWidth,
          color: self.getColor(accessor),
          accessor: accessor,
          data: d
        }
        stackedY += d[key]
        flatData.push(obj)
      })
    })
    // Render the flat data structure
    var svgBarGroups = self.svgSelection().select('g.drawing-' + self.getName()).selectAll('.bar').data(flatData, function (d) { return d.id })
    svgBarGroups.enter().append('rect')
      .attr('class', function (d) { return d.className })
      .attr('x', function (d) { return d.x })
      .attr('y', yScale.range()[0])
      .attr('height', 0)
      .attr('width', function (d) { return d.w })
      .on('mouseover', function (d) {
        var pos = self.$el.offset()
        var tooltipOffset = {
          left: d.x + pos.left,
          top: d.y + pos.top
        }
        self.eventObject.trigger('showTooltip', tooltipOffset, d.data, d.accessor.tooltip)
        d3.select(this).classed('active', true)
      })
      .on('mouseout', function (d) {
        // var pos = $( this ).offset() // not working in jquery 3
        self.eventObject.trigger('hideTooltip')
        d3.select(this).classed('active', false)
      })
      .merge(svgBarGroups).transition().ease(d3.easeLinear).duration(self.params.duration)
      .attr('fill', function (d) { return d.color })
      .attr('x', function (d) { return d.x })
      .attr('y', function (d) { return d.y })
      .attr('height', function (d) { return d.h })
      .attr('width', function (d) { return d.w })
    svgBarGroups.exit().remove()
  },

  render: function () {
    var self = this
    _.defer(function () {
      self.renderData()
    })
    return self
  }
})

module.exports = StackedBarChartView
