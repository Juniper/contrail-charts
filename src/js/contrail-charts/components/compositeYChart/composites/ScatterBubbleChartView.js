/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery', 'underscore', 'd3',
  'contrail-charts/models/Events',
  'contrail-charts/views/ContrailChartsView'
], function ($, _, d3, Events, ContrailChartsView) {
  var ScatterBubbleChartView = ContrailChartsView.extend({
    tagName: 'div',
    className: 'scatter-bubble-chart',
    chartType: 'scatterBubble',
    renderOrder: 50,

    initialize: function (options) {
      // / The config model
      this.config = options.config
      this.axisName = options.axisName

      // The child's params are reset by parent.

      // TODO: should child react to model and config changes?
      // this.listenTo(this.model, "change", this.render)
      // this.listenTo(this.config, "change", this.render)
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

    getBubbleColor: function (accessor, key) {
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
    calculateScales: function () {
      // Calculate the r scales. Calculatation done by parent based on shape domains.
      // A scatter bubble chart adds additional axis - one for every bubble shape - for example rcircle, rsquare, ...
      /*
      var self = this
      _.each( self.params.activeAccessorData, function( accessor, key ) {
          if( accessor.sizeAccessor ) {
              var scaleName = "r" + accessor.sizeAccessor + "Scale"
              var sizeDomainName = "r" + accessor.sizeAccessor + "Domain"
              var innerRange = [ 2, Math.max( 2, self.params.innerMargin ) ]
              self.params[scaleName] = d3.scaleLinear().domain( self.params[sizeDomainName] ).range( innerRange )
          }
      })
      */
    },

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
        .on('mouseover', function (d) {
          // var pos = $(this).offset() // not working in jquery 3
          self.eventObject.trigger('mouseover', d.data, d.x + d.r * 0.71, d.y - d.r * 0.71, d.accessor)
          d3.select(this).classed('active', true)
        })
        .on('mouseout', function (d) {
          // var pos = $(this).offset() // not working in jquery 3
          self.eventObject.trigger('mouseout', d.data, d.x + d.r * 0.71, d.y - d.r * 0.71)
          d3.select(this).classed('active', false)
        })
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
            color: self.getBubbleColor(accessor, key),
            accessor: accessor,
            data: d
          }
          flatData.push(obj)
        })
      })
      console.log('Rendering data in ScatterBubbleChart: ', flatData, self.params, self.getName())
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
    }
  })

  return ScatterBubbleChartView
})
