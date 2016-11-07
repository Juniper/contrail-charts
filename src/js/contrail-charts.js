var ChartView = require('contrail-charts/ChartView')
var XYChartView = require('contrail-charts/charts/XYChartView')
var BindingHandler = require('contrail-charts/BindingHandler')
var CompositeYChartConfigModel = require('contrail-charts/models/CompositeYChartConfigModel')
var ControlPanelConfigModel = require('contrail-charts/models/ControlPanelConfigModel')
var MessageConfigModel = require('contrail-charts/models/MessageConfigModel')
var NavigationConfigModel = require('contrail-charts/models/NavigationConfigModel')
var TooltipConfigModel = require('contrail-charts/models/TooltipConfigModel')
var RadialChartConfigModel = require('contrail-charts/models/RadialChartConfigModel')
var ContrailChartsDataModel = require('contrail-charts/models/ContrailChartsDataModel')
var DataProvider = require('contrail-charts/models/DataProvider')
var CompositeYChartView = require('contrail-charts/views/CompositeYChartView')
var ControlPanelView = require('contrail-charts/views/ControlPanelView')
var MessageView = require('contrail-charts/views/MessageView')
var NavigationView = require('contrail-charts/views/NavigationView')
var TooltipView = require('contrail-charts/views/TooltipView')
var RadialChartView = require('contrail-charts/views/RadialChartView')

require('../sass/contrail-charts.scss')

module.exports = {
  ChartView: ChartView,
  XYChartView: XYChartView,
  BindingHandler: BindingHandler,
  ContrailChartsDataModel: ContrailChartsDataModel,
  DataProvider: DataProvider,
  components: {
    tooltip: {
      configModel: TooltipConfigModel,
      view: TooltipView,
    },
    navigation: {
      configModel: NavigationConfigModel,
      view: NavigationView,
    },
    message: {
      configModel: MessageConfigModel,
      view: MessageView,
    },
    controlPanel: {
      configModel: ControlPanelConfigModel,
      view: ControlPanelView,
    },
    xyChart: {
      configModel: CompositeYChartConfigModel,
      view: CompositeYChartView,
    },
    radialChart: {
      configModel: RadialChartConfigModel,
      view: RadialChartView,
    },
  },
}
