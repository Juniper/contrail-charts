var ControlPanelConfigModel = require('contrail-charts/components/control-panel/ControlPanelConfigModel')
var ControlPanelView = require('contrail-charts/components/control-panel/ControlPanelView')
var MessageConfigModel = require('contrail-charts/components/message/MessageConfigModel')
var MessageView = require('contrail-charts/components/message/MessageView')
var NavigationConfigModel = require('contrail-charts/components/navigation/NavigationConfigModel')
var NavigationView = require('contrail-charts/components/navigation/NavigationView')
var TooltipConfigModel = require('contrail-charts/components/tooltip/TooltipConfigModel')
var TooltipView = require('contrail-charts/components/tooltip/TooltipView')
var CompositeYChartConfigModel = require('contrail-charts/components/xy/CompositeYChartConfigModel')
var CompositeYChartView = require('contrail-charts/components/xy/CompositeYChartView')
var RadialChartConfigModel = require('contrail-charts/components/radial/RadialChartConfigModel')
var RadialChartView = require('contrail-charts/components/radial/RadialChartView')

module.exports = {
  tooltip: {
    ConfigModel: TooltipConfigModel,
    View: TooltipView
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
    ConfigModel: RadialChartConfigModel,
    View: RadialChartView
  }
}
