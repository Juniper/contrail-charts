define([
  'jquery', 'lodash',
  'contrail-charts/base/ContrailChartsView',
  'contrail-charts/base/ContrailChartsDataModel',
  './RadialChartConfigModel',
], function (
  $, _,
  ContrailChartsView,
  ContrailChartsDataModel,
  RadialChartConfigModel
) {
  /**
  * Group of charts rendered in polar coordinates system
  * TODO merge with ChartView as long as XYChart too
  */
  var RadialView = ContrailChartsView.extend({
    tagName: 'div',
    className: 'coCharts-radial-chart',

    initialize: function (options) {
      var self = this
      self.config = options.config

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
      self._color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
      self._renderSVG()
    },

    _onDataModelChange: function () {
      this.render()
    },

    _onConfigModelChange: function () {
      this.render()
    },

    _renderSVG: function () {
      var self = this
      var width = self.config.get('chartWidth')
      var height = self.config.get('chartHeight')
      var radius = self.config.get('radius')
      var data = self.model.get('data')

      var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0)

      var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40)

      var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.y })(data)

      d3.select(self.el).append('svg').attr('class', 'coCharts-svg')
      self.svgSelection()
        .attr("width", width)
        .attr("height", height)
      var group = self.svgSelection().append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arcs = group.selectAll("arc")
        .data(pie)
        .enter().append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return self._color(d.data.x); });

      arcs.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")" })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.x })
    },
  })

  return RadialView
})
