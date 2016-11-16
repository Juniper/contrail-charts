var ControlPanelConfigModel = require('./controlPanel/ControlPanelConfigModel')
var ControlPanelView = require('./controlPanel/ControlPanelView')
var MessageConfigModel = require('./message/MessageConfigModel')
var MessageView = require('./message/MessageView')
var NavigationConfigModel = require('./navigation/NavigationConfigModel')
var NavigationView = require('./navigation/NavigationView')
var TooltipConfigModel = require('./tooltip/TooltipConfigModel')
var TooltipView = require('./tooltip/TooltipView')
var CompositeYChartConfigModel = require('./compositeYChart/CompositeYChartConfigModel')
var CompositeYChartView = require('./compositeYChart/CompositeYChartView')
var RadialChartConfigModel = require('./radialChart/RadialChartConfigModel')
var RadialChartView = require('./radialChart/RadialChartView')

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
