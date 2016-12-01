/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')
// Todo doesn't work. loop issue.
// var charts = require('charts/index')
var charts = {
  XYChartView: require('charts/xy-chart/XYChartView'),
  RadialChartView: require('charts/radial-chart/RadialChartView')

}
var components = require('components/index')
var handlers = require('handlers/index')

var ChartView = ContrailChartsView.extend({
  initialize: function () {
    var self = this
    self._charts = {}
    self._components = []
  },

  /**
  * Data can be set separately into every chart so every chart can have different data.
  */
  setData: function (data, dataConfig, chartId) {
    var self = this
    dataConfig = dataConfig || {}
    chartId = chartId || 'default'
    // Set data to the given chart if it exists.
    if (self._charts[chartId]) self._charts[chartId].setData(data, dataConfig)
  },

  /**
  * Sets the config for all charts that can be part of this parent chart.
  * This config needs to be set before setData because when setting data we need the sub chart to be already defined in order to set data into it.
  */
  setConfig: function (config) {
    var self = this
    self._config = config
    // Initialize parent handlers
    self._initHandlers()
    // Initialize child charts
    self._initCharts()
    // Initialize parent components
    self._initComponents()
  },

  _initHandlers: function () {
    var self = this
    _.each(self._config.handlers, function (handler) {
      self._registerHandler(handler.type, handler.config)
    })
  },

  _registerHandler: function (type, config) {
    var self = this
    if (!self._isEnabledHandler(type)) return false
    // Todo create handlers array similar to components.
    if (type === 'bindingHandler') {
      if (!self.bindingHandler) {
        self.bindingHandler = new handlers.BindingHandler(config)
      } else {
        self.bindingHandler.addBindings(config.bindings, self._config.chartId)
      }
    }
    if (type === 'dataProvider') {
      // Set dataProvider config. Eg. input data formatter config
      self._dataProvider.set(config, { silent: true })
      // Since we're setting the config, trigger a change to parentDataModel to re-compute based on new config.
      // Triggering the change on parentModel triggers prepareData on all the dataProvider instances of same parentModel.
      // Todo check if we really need to trigger this or simply call prepareData in current dataProvider?
      self._dataProvider.getParentModel().trigger('change')
    }
  },

  /**
   * Initialize child chart views.
   */
  _initCharts: function () {
    var self = this
    // Iterate through the self._config.charts array, initialize the given charts, set their binding handle and config.
    _.each(self._config.charts, function (chart) {
      self._registerChart(chart)
    })
  },

  _registerChart: function (chart) {
    var self = this
    if (chart.chartId) {
      if (!self._charts[chart.chartId]) {
        self._charts[chart.chartId] = new charts[chart.type]()
      }
      if (self._isEnabledHandler('bindingHandler')) {
        self._charts[chart.chartId].setBindingHandler(self.bindingHandler)
      }
      self._charts[chart.chartId].setConfig(chart)
    }
  },

  _initComponents: function () {
    var self = this
    _.each(self._config.components, function (component) {
      self._registerComponent(component.type, component.config, self._dataProvider, component.id)
    })
    if (self._isEnabledComponent('navigation')) {
      var dataModel = self.getComponentByType('navigation').getFocusDataProvider()
      if (self._isEnabledComponent('compositeY')) self.getComponentByType('compositeY').changeModel(dataModel)
    }
    if (self._isEnabledHandler('bindingHandler') && !self.hasExternalBindingHandler) {
      // Only start the binding handler if it is not an external one.
      // Otherwise assume it will be started by the parent chart.
      self.bindingHandler.start()
    }
  },

  _registerComponent: function (type, config, model, id) {
    var self = this
    if (!self._isEnabledComponent(type)) return false
    var configModel = new components[type].ConfigModel(config)
    var viewOptions = _.extend(config, {
      id: id,
      config: configModel,
      model: model,
      eventObject: self.eventObject
    })
    var component = new components[type].View(viewOptions)
    self._components.push(component)

    if (self._isEnabledHandler('bindingHandler') || self.hasExternalBindingHandler) {
      self.bindingHandler.addComponent(self._config.chartId, type, component)
    }
    return component
  },

  _isEnabled: function (config, type) {
    var foundConfig = _.find(config, {type: type})
    if (!foundConfig) return false
    if (_.isObject(foundConfig.config)) {
      return !(foundConfig.config.enable === false)
    }
    return false
  },

  _isEnabledComponent: function (type) {
    var self = this
    return self._isEnabled(self._config.components, type)
  },

  _isEnabledHandler: function (type) {
    var self = this
    return self._isEnabled(self._config.handlers, type)
  },

  render: function () {
    var self = this
    _.each(self._charts, function (chart) {
      chart.render()
    })
    _.each(self._components, function (component) {
      component.render()
    })
  }
})

module.exports = ChartView
