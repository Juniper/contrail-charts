/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsDataModel = require('contrail-charts-data-model')
var ContrailChartsView = require('contrail-charts-view')
var components = require('contrail-charts/components/index')
var handlers = require('contrail-charts/handlers/index')
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
var XYChartView = ContrailChartsView.extend({
  initialize: function (options) {
    var self = this
    self.hasExternalBindingHandler = false
    self._dataModel = new ContrailChartsDataModel()
    self._dataProvider = new handlers.DataProvider({ parentDataModel: self._dataModel })
    self._components = {}
    options = options || {}
    self.eventObject = options.eventObject || _.extend({}, Events)
    self.eventObject.daniel = true
  },
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData: function (data, dataConfig) {
    var self = this
    if (dataConfig) self.setDataConfig(dataConfig)
    if (_.isArray(data)) self._dataModel.setData(data)
  },
  /**
   * Set ContrailChartsDataModel config
   * @param dataConfig
   */
  setDataConfig: function (dataConfig) {
    var self = this
    dataConfig = dataConfig || {}
    self._dataModel.set(dataConfig, { silent: true })
  },
  /**
  * Provides a global BindingHandler to this chart.
  * If no BindingHandler is provided it will be instantiated by this chart if needed based on its local configuration.
  */
  setBindingHandler: function (bindingHandler) {
    var self = this
    self.hasExternalBindingHandler = (bindingHandler != null)
    self.bindingHandler = bindingHandler
  },
  /**
  * Sets the configuration for this chart as a simple object.
  * Instantiate the required views if they do not exist yet, set their configurations otherwise.
  * Setting configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
  */
  setConfig: function (config) {
    var self = this
    self._config = config
    if (!self._config.chartId) {
      self._config.chartId = 'XYChartView'
    }
    self._initComponents()
  },

  _registerComponent: function (name, config, model) {
    var self = this
    var component = self._components[name]
    if (!self._isEnabledComponent(name)) return false
    if (!component) {
      var configModel = new components[name].ConfigModel(config)
      var viewOptions = _.extend(config, {
        config: configModel,
        model: model,
        eventObject: self.eventObject
      })
      self._components[name] = new components[name].View(viewOptions)
      component = self._components[name]

      if (self._isEnabledComponent('bindingHandler') || self.hasExternalBindingHandler) {
        self.bindingHandler.addComponent(self._config.chartId, name, component)
      }
    } else {
      component.config.set(config)
    }
    return component
  },

  _initComponents: function () {
    var self = this
    // Todo initilize data model config similar to components.
    if (self._config.dataConfig) self.setDataConfig(self._config.dataConfig)
    // If bindingHandler is defined, init it before looping through component registration.
    if (self._isEnabledComponent('bindingHandler')) {
      if (!self.bindingHandler) {
        self.bindingHandler = new handlers.BindingHandler(self._config.bindingHandler)
      } else {
        self.bindingHandler.addBindings(self._config.bindingHandler.bindings, self._config.chartId)
      }
    }
    _.each(self._config, function (config, name) {
      // dataConfig and bindingHandler component registration will be handled differently.
      if (name === 'dataConfig' || name === 'bindingHandler') {
        return
      }
      self._registerComponent(name, config, self._dataProvider)
    })
    if (self._isEnabledComponent('navigation')) {
      var dataModel = self._components.navigation.getFocusDataProvider()
      if (self._isEnabledComponent('xyChart')) self._components.xyChart.changeModel(dataModel)
    }
    if (self._isEnabledComponent('bindingHandler') && !self.hasExternalBindingHandler) {
      // Only start the binding handler if it is not an external one.
      // Otherwise assume it will be started by the parent chart.
      self.bindingHandler.start()
    }
  },

  renderMessage: function (msgObj) {
    this.eventObject.trigger('message', msgObj)
  },

  clearMessage: function (componentId) {
    // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
    var msgObj = {
      componentId: componentId,
      action: 'update',
      messages: []
    }
    this.eventObject.trigger('message', msgObj)
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
    _.each(self._components, function (component) {
      component.render()
    })
  }
})

module.exports = XYChartView
