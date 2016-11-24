var ControlPanelConfigModel = require('contrail-charts/components/control-panel/ControlPanelConfigModel')
var ControlPanelView = require('contrail-charts/components/control-panel/ControlPanelView')
var MessageConfigModel = require('contrail-charts/components/message/MessageConfigModel')
var MessageView = require('contrail-charts/components/message/MessageView')
var NavigationConfigModel = require('contrail-charts/components/navigation/NavigationConfigModel')
var NavigationView = require('contrail-charts/components/navigation/NavigationView')
var TooltipConfigModel = require('contrail-charts/components/tooltip/TooltipConfigModel')
var TooltipView = require('contrail-charts/components/tooltip/TooltipView')
var LegendConfigModel = require('contrail-charts/components/legend/LegendConfigModel')
var LegendView = require('contrail-charts/components/legend/LegendView')
var CompositeYChartConfigModel = require('contrail-charts/components/xy/CompositeYChartConfigModel')
var CompositeYChartView = require('contrail-charts/components/xy/CompositeYChartView')
var PieChartConfigModel = require('contrail-charts/components/radial/PieChartConfigModel')
var PieChartView = require('contrail-charts/components/radial/PieChartView')

module.exports = {
  tooltip: {
    ConfigModel: TooltipConfigModel,
    View: TooltipView
  },
  legend: {
    ConfigModel: LegendConfigModel,
    View: LegendView
  },
  navigation: {
    ConfigModel: NavigationConfigModel,
    View: NavigationView
  },
  message: {
    ConfigModel: MessageConfigModel,
    View: MessageView
  },
  controlPanel: {
    ConfigModel: ControlPanelConfigModel,
    View: ControlPanelView
  },
  xyChart: {
    ConfigModel: CompositeYChartConfigModel,
    View: CompositeYChartView
  },
  radialChart: {
    ConfigModel: PieChartConfigModel,
    View: PieChartView
  }
}
