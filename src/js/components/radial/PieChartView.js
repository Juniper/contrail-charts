/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')
var ContrailChartsDataModel = require('contrail-charts-data-model')
var PieChartConfigModel = require('./PieChartConfigModel')
/**
* Group of charts rendered in polar coordinates system
* TODO merge with ChartView as long as XYChart too
*/
var PieChartView = ContrailChartsView.extend({
  type: 'radialChart',
  tagName: 'div',
  className: 'coCharts-radial-chart',

  events: {
    'mouseover .arc': '_onHover',
  },

  initialize: function (options) {
    var self = this
    self.config = options.config
    self.eventObject = options.eventObject || _.extend({}, Events)

    self.listenTo(self.config, 'change', self._onConfigModelChange)
  },

  changeModel: function (model) {
    var self = this
    self.stopListening(self.model)
    self.model = model
    self.listenTo(self.model, 'change', self._onDataModelChange)
  },

  render: function () {
    var self = this
    self._renderSVG()
  },

  _onDataModelChange: function () {
    this.render()
  },

  _onConfigModelChange: function () {
    this.render()
  },

  _onHover: function (e) {
    var self = this
    var width = self.config.get('chartWidth')
    var height = self.config.get('chartHeight')
    var radius = self.config.get('radius')
    var data = e.currentTarget.__data__.data
    var valueAccessor = self.config.get('serie').getValue
    self.eventObject.trigger('showTooltip', {left: width /2 - radius * 0.8 , top: height /2}, data)
    //d3.select(this).classed('active', true)
  },

  _renderSVG: function () {
    var self = this
    var width = self.config.get('chartWidth')
    var height = self.config.get('chartHeight')
    var serieConfig = self.config.get('serie')
    var radius = self.config.get('radius')
    var data = self.model.get('data')

    var arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 0.75)

    var pie = d3.pie()
      .sort(null)
      .value(function(d) { return serieConfig.getValue(d) })(data)

    d3.select(self.el).append('svg').attr('class', 'coCharts-svg pie-chart')
    self.svgSelection()
      .attr('width', width)
      .attr('height', height)
    var group = self.svgSelection().append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    var arcs = group.selectAll('arc')
      .data(pie)
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .style('fill', function(d) {
        return self.config.getColor(serieConfig.getLabel(d.data))
      })
  }
})

module.exports = PieChartView
