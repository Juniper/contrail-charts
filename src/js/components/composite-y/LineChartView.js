/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var XYChartSubView = require('components/composite-y/XYChartSubView')

/**
* This is the child view for CompositeYChartView.
*/
var LineChartView = XYChartSubView.extend({
  tagName: 'div',
  className: 'line-chart',
  chartType: 'line',
  renderOrder: 10,

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
    })
    domains[self.axisName] = d3.extent(domains[self.axisName])
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
    enteringSelection.append('g').attr('class', 'lines')
  },

  getTooltipData: function (data, xPos) {
    var self = this
    var xAccessor = self.params.plot.x.accessor
    var xScale = self.getXScale()
    var xBisector = d3.bisector(function (d) {
      return d[xAccessor]
    }).left
    var xVal = xScale.invert(xPos)
    // if( _.isDate( xVal ) ) {
    //    xVal = xVal.getTime()
    // }
    var index = xBisector(data, xVal, 1)
    var dataItem = xVal - data[index - 1][xAccessor] > data[index][xAccessor] - xVal ? data[index] : data[index - 1]
    return dataItem
  },

  renderData: function () {
    var self = this
    var data = self.getData()
    var svg = self.svgSelection().select('g.drawing-' + self.getName())

    // Draw one line (path) for each Y accessor.
    // Collect linePathData - one line per Y accessor.
    var linePathData = []
    var lines = {}
    var yScale = self.getYScale()
    var xScale = self.getXScale()
    var zeroLine = d3.line()
      .x(function (d) {
        return xScale(d[self.params.plot.x.accessor])
      })
      .y(function (d) {
        return yScale.range()[0]
      })
    _.each(self.params.activeAccessorData, function (accessor) {
      var key = accessor.accessor
      lines[key] = d3.line()
        .x(function (d) {
          return xScale(d[self.params.plot.x.accessor])
        })
        .y(function (d) {
          return yScale(d[key])
        })
        .curve(self.config.get('curve'))
      linePathData.push({ key: key, accessor: accessor, data: data })
    })

    var svgLines = svg.selectAll('.line').data(linePathData, function (d) { return d.key })
    svgLines.enter().append('path')
      .attr('class', function (d) { return 'line line-' + d.key })
      .attr('d', function (d) { return zeroLine(data) })
      .merge(svgLines)
      .on('mouseover', function (d) {
        var pos = d3.mouse(this)
        var offset = self.$el.offset()
        var dataItem = self.getTooltipData(d.data, pos[0])
        var tooltipOffset = {
          top: offset.top + pos[1],
          left: offset.left + pos[0] - xScale.range()[0]
        }

        self.eventObject.trigger('showTooltip', tooltipOffset, dataItem, d.accessor.tooltip)
        d3.select(this).classed('active', true)
      })
      .on('mouseout', function (d) {
        self.eventObject.trigger('hideTooltip', d.accessor.tooltip)
        d3.select(this).classed('active', false)
      })
      .transition().ease(d3.easeLinear).duration(self.params.duration)
      .attr('stroke', function (d) { return self.getColor(d.accessor) })
      .attr('d', function (d) { return lines[d.key](data) })
    svgLines.exit().remove()
  },

  render: function () {
    var self = this
    _.defer(function () {
      self.renderData()
    })
    return self
  }
})

module.exports = LineChartView
