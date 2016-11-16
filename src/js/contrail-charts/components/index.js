var ControlPanelConfigModel = require('./control-panel/ControlPanelConfigModel')
var ControlPanelView = require('./control-panel/ControlPanelView')
var MessageConfigModel = require('./message/MessageConfigModel')
var MessageView = require('./message/MessageView')
var NavigationConfigModel = require('./navigation/NavigationConfigModel')
var NavigationView = require('./navigation/NavigationView')
var TooltipConfigModel = require('./tooltip/TooltipConfigModel')
var TooltipView = require('./tooltip/TooltipView')
var CompositeYChartConfigModel = require('./composite-y-chart/CompositeYChartConfigModel')
var CompositeYChartView = require('./composite-y-chart/CompositeYChartView')
var RadialChartConfigModel = require('./composite-radial-chart/RadialChartConfigModel')
var RadialChartView = require('./composite-radial-chart/RadialChartView')

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
