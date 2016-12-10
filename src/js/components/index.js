var ControlPanelConfigModel = require('components/control-panel/ControlPanelConfigModel')
var ControlPanelView = require('components/control-panel/ControlPanelView')
var MessageConfigModel = require('components/message/MessageConfigModel')
var MessageView = require('components/message/MessageView')
var NavigationConfigModel = require('components/navigation/NavigationConfigModel')
var NavigationView = require('components/navigation/NavigationView')
var TooltipConfigModel = require('components/tooltip/TooltipConfigModel')
var TooltipView = require('components/tooltip/TooltipView')
var LegendConfigModel = require('components/legend/LegendConfigModel')
var LegendView = require('components/legend/LegendView')
var LegendUniversalConfigModel = require('components/legend-universal/LegendConfigModel')
var LegendUniversalView = require('components/legend-universal/LegendView')
var CrosshairConfigModel = require('components/crosshair/CrosshairConfigModel')
var CrosshairView = require('components/crosshair/CrosshairView')
var ColorPickerConfigModel = require('components/color-picker/ColorPickerConfigModel')
var ColorPickerView = require('components/color-picker/ColorPickerView')
var CompositeYChartConfigModel = require('components/composite-y/CompositeYChartConfigModel')
var CompositeYChartView = require('components/composite-y/CompositeYChartView')
var PieChartConfigModel = require('components/radial/PieChartConfigModel')
var PieChartView = require('components/radial/PieChartView')

module.exports = {
  tooltip: {
    ConfigModel: TooltipConfigModel,
    View: TooltipView
  },
  legend: {
    ConfigModel: LegendConfigModel,
    View: LegendView
  },
  legendUniversal: {
    ConfigModel: LegendUniversalConfigModel,
    View: LegendUniversalView,
  },
  crosshair: {
    ConfigModel: CrosshairConfigModel,
    View: CrosshairView
  },
  colorPicker: {
    ConfigModel: ColorPickerConfigModel,
    View: ColorPickerView
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
  compositeY: {
    ConfigModel: CompositeYChartConfigModel,
    View: CompositeYChartView
  },
  radialChart: {
    ConfigModel: PieChartConfigModel,
    View: PieChartView
  }
}
