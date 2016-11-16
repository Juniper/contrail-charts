/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery',
  'underscore',
  'd3',
  'contrail-charts/contrail/ContrailChartsEvents',
  'contrail-charts/contrail/ContrailChartsView'
], function ($, _, d3, Events, ContrailChartsView) {
  /**
  * This is the child view for CompositeYChartView.
  */
  var LineChartView = ContrailChartsView.extend({
    tagName: 'div',
    className: 'line-chart',
    chartType: 'line',
    renderOrder: 10,

    initialize: function (options) {
      // / The config model
      this.config = options.config
      this.axisName = options.axisName

      // The child's params are reset by parent.
      this.eventObject = _.extend({}, Events)
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

    getLineColor: function (accessor) {
      var self = this
      if (_.has(accessor, 'color')) {
        return accessor.color
      } else {
        if (!self.params[accessor.axis + 'ColorScale']) {
          self.params[accessor.axis + 'ColorScale'] = d3.scaleOrdinal(d3.schemeCategory20)
        }
        return self.params[accessor.axis + 'ColorScale'](accessor.accessor)
      }
    },

    getTooltipData: function (data, xPos) {
      var self = this
      var xAccessor = self.params.plot.x.accessor
      var xScale = self.params.axis[self.params.plot.x.axis].scale
      var xBisector = d3.bisector(function (d) {
        var x = d[xAccessor]
        return x
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
      var xScale = self.params.axis[self.params.plot.x.axis].scale
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
      console.log('Rendering data in LineChartView: ', data, self.params, linePathData, self.getName())

      var svgLines = svg.selectAll('.line').data(linePathData, function (d) { return d.key })
      svgLines.enter().append('path')
        .attr('class', function (d) { return 'line line-' + d.key })
        .attr('d', function (d) { return zeroLine(data) })
        .merge(svgLines)
        .on('mouseover', function (d) {
          var pos = d3.mouse(this) // $(this).offset()
          var offset = $(this).offset()
          var dataItem = self.getTooltipData(d.data, pos[0])
          self.eventObject.trigger('mouseover', dataItem, offset.left + pos[0] - xScale.range()[0], offset.top, d.accessor)
          d3.select(this).classed('active', true)
        })
        .on('mouseout', function (d) {
          var pos = $(this).offset()
          self.eventObject.trigger('mouseout', d, pos.left, pos.top)
          d3.select(this).classed('active', false)
        })
        .transition().ease(d3.easeLinear).duration(self.params.duration)
        .attr('stroke', function (d) { return self.getLineColor(d.accessor) })
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

  return LineChartView
})
