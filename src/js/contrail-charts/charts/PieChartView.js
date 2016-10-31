define([
  'jquery', 'lodash',
  'contrail-charts/views/ContrailChartsView',
  'contrail-charts/models/ContrailChartsDataModel',
  'contrail-charts/models/PieChartConfigModel',
  'contrail-charts/views/View',
], function (
  $, _,
  ContrailChartsView,
  ContrailChartsDataModel,
  PieChartConfigModel,
  View
) {
  /**
  * Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
  * Many different Y axis may be configured.
  */
  var PieChartView = ContrailChartsView.extend({
    initialize: function (config) {
      var self = this
      if (_.isObject(config)) { self.setConfig(config) }
    },

    setData: function (data) {
      var self = this
      self._dataModel = new ContrailChartsDataModel();
      self.listenTo(self._dataModel, 'change', self.render.bind(self))
      self.listenTo(self._configModel, 'change', self._onConfigChanged)
      if (_.isArray(data)) {
        self._dataModel.setData(data)
      }
    },

    setConfig: function (config) {
      var self = this
      if (!_.isObject(config)) return
      self._configModel = new PieChartConfigModel(config)
      self._initComponents()
    },

    _initComponents: function () {
    },

    _isEnabledComponent: function (name) {
      var self = this
      var enabled = false
      if (_.isObject(self._config[name])) {
        if (self._config[name].enable !== false) {
          enabled = true
        }
      }
      return enabled
    },


    render: function () {
      var self = this
      self._color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
      self._renderSVG();
    },

    _renderSVG: function () {
      var self = this
      var width = self._configModel.get('chartWidth')
      var height = self._configModel.get('chartHeight')
      var radius = self._configModel.get('radius')
      var data = self._dataModel.get('data')

      var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

      var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

      var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.y; })(data)

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
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.x; });
      },
    })

  return PieChartView
})
