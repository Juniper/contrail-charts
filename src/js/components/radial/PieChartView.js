/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
// Todo why config model is not used?
// var ContrailChartsDataModel = require('contrail-charts-data-model')
// var PieChartConfigModel = require('./PieChartConfigModel')
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
    ContrailChartsView.prototype.initialize.call(self, options)

    self.listenTo(self.model, 'change', self._onDataModelChange)
    self.listenTo(self.config, 'change', self._onConfigModelChange)
  },

  changeModel: function (model) {
    var self = this
    self.stopListening(self.model)
    self.model = model
    self.listenTo(self.model, 'change', self._onDataModelChange)
  },

  _onDataModelChange: function () {
    this.render()
  },

  _onConfigModelChange: function () {
    this.render()
  },

  _onHover: function (e) {
    var self = this
    // TODO consider case with missing width config in order to occupy all available space
    var width = self.config.get('chartWidth')
    var height = self.config.get('chartHeight')
    var radius = self.config.getInnerRadius()
    var data = e.currentTarget.__data__.data
    // var valueAccessor = self.config.get('serie').getValue
    const chartOffset = this.$el[0].getBoundingClientRect()
    const tooltipOffset = {
      left: chartOffset.left + width / 2 - radius * 0.707,
      top: chartOffset.top + height / 2 - radius * 0.707,
      width: radius * 0.707 * 2,
      height: radius * 0.707 * 2,
    }
    self._eventObject.trigger('showTooltip', tooltipOffset, data)
    // d3.select(this).classed('active', true)
  },

  render: function () {
    var self = this
    var width = self.config.get('chartWidth')
    var height = self.config.get('chartHeight')
    var serieConfig = self.config.get('serie')
    var radius = self.config.get('radius')
    var data = self.model.get('data')

    var arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(this.config.getInnerRadius())

    var pie = d3.pie()
      .sort(null)
      .value(function (d) { return serieConfig.getValue(d) })(data)

    d3.select(self.el).append('svg').attr('class', 'coCharts-svg pie-chart')
    self.svgSelection()
      .attr('width', width)
      .attr('height', height)
    var group = self.svgSelection().append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    var arcs = group.selectAll('arc')
      .data(pie)
      .enter().append('g')
      .attr('class', 'arc')

    arcs.append('path')
      .attr('d', arc)
      .style('fill', function (d) {
        return self.config.getColor(serieConfig.getLabel(d.data))
      })

    ContrailChartsView.prototype.render.call(self)
  }
})

module.exports = PieChartView
