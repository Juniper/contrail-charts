/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var BarChartView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'bar-chart',
  chartType: 'bar',
  renderOrder: 100,

  initialize: function (options) {
    var self = this
    self.config = options.config
    self.axisName = options.axisName
    self.eventObject = options.eventObject || _.extend({}, Events)
  },

  /**
  * Returns the unique name of this drawing so it can identify itself for the parent.
  * The drawing's name is of the following format: [axisName]-[chartType] ie. "y1-line".
  */
  getName: function () {
    return this.axisName + '-' + this.chartType
  },

  getYScale: function () {
    return this.params.axis[this.axisName].scale
  },

  getBarColor: function (accessor, key) {
    var self = this
    if (_.has(accessor, 'color')) {
      return accessor.color
    } else {
      if (!self.params[accessor.axis + 'ColorScale']) {
        self.params[accessor.axis + 'ColorScale'] = d3.scaleOrdinal(d3.schemeCategory20)
      }
      return self.params[accessor.axis + 'ColorScale'](key)
    }
  },

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
   * Renders an empty chart.
   * Changes chart dimensions if it already exists.
   */
  renderSVG: function () {},

  renderData: function () {
    var self = this
    var data = self.getData()
    var yScale = self.getYScale()
    var xScale = self.params.axis[self.params.plot.x.axis].scale

    // Create a flat data structure
    var flatData = []
    var j
    var numOfAccessors = _.keys(self.params.activeAccessorData).length
    var xValues = _.map(self.getData(), self.params.plot.x.accessor)
    var xValuesExtent = d3.extent(xValues)
    var xRange = [xScale(xValuesExtent[0]), xScale(xValuesExtent[1])]
    var len = data.length - 1
    if (len === 0) {
      len = 1
    }
    var bandWidth = (0.95 * ((xRange[1] - xRange[0]) / len) - 1)
    var bandWidthHalf = (bandWidth / 2)
    var innerBandScale = d3.scaleBand().domain(d3.range(numOfAccessors)).range([0, bandWidth]).paddingInner(0.05).paddingOuter(0.05)
    var innerBandWidth = (innerBandScale.bandwidth())
    _.each(data, function (d) {
      j = 0
      var x = d[self.params.plot.x.accessor]
      _.each(self.params.activeAccessorData, function (accessor) {
        var key = accessor.accessor
        var y = d[key]
        var obj = {
          id: x + '-' + key,
          className: 'bar bar-' + key,
          x: xScale(x) - bandWidthHalf + innerBandScale(j),
          y: yScale(y),
          h: yScale.range()[0] - yScale(y),
          w: innerBandWidth,
          color: self.getBarColor(accessor, key),
          accessor: accessor,
          data: d
        }
        flatData.push(obj)
        j++
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
        // var pos = $(this).offset() // not working in jquery 3
        self.eventObject.trigger('showTooltip', d.data, d.x, d.y, d.accessor)
        d3.select(this).classed('active', true)
      })
      .on('mouseout', function (d) {
        // var pos = $(this).offset() // not working in jquery 3
        self.eventObject.trigger('hideTooltip', d.data, d.x, d.y)
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

module.exports = BarChartView
