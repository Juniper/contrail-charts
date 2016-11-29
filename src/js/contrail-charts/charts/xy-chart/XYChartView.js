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
    self._components = []
    options = options || {}
    self.eventObject = options.eventObject || _.extend({}, Events)
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

  getComponentByType: function (type) {
    var self = this
    return _.find(self._components, {type: type})
  },

  _initComponents: function () {
    var self = this
    // Todo initilize data model config similar to components.
    if (self._config.dataConfig) self.setDataConfig(self._config.dataConfig)
    // If bindingHandler is defined, init it before looping through component registration.
    if (self._isEnabledComponent('bindingHandler')) {
      if (!self.bindingHandler) {
        self.bindingHandler = new handlers.BindingHandler(_.find(self._config.components, {type: 'bindingHandler'}))
      } else {
        self.bindingHandler.addBindings(_.find(self._config.components, 'bindingHandler').bindings, self._config.chartId)
      }
    }
    _.each(self._config.components, function (component) {
      // dataConfig and bindingHandler component registration will be handled differently.
      if (component.type === 'dataConfig' || component.type === 'bindingHandler') {
        return
      }
      self._registerComponent(component.type, component.config, self._dataProvider, component.id)
    })
    if (self._isEnabledComponent('navigation')) {
      var dataModel = _.find(self._components, {type: 'navigation'}).getFocusDataProvider()
      if (self._isEnabledComponent('xyChart')) _.find(self._components, {type: 'xyChart'}).changeModel(dataModel)
    }
    if (self._isEnabledComponent('bindingHandler') && !self.hasExternalBindingHandler) {
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

    if (self._isEnabledComponent('bindingHandler') || self.hasExternalBindingHandler) {
      self.bindingHandler.addComponent(self._config.chartId, type, component)
    }
    return component
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

  _isEnabledComponent: function (type) {
    var self = this
    var componentConfig = _.find(self._config.components, {type: type})
    if (!componentConfig) return false
    if (_.isObject(componentConfig.config)) {
      return !(componentConfig.config.enable === false)
    }
    return false
  },

  render: function () {
    var self = this
    _.each(self._components, function (component) {
      component.render()
    })
  }
})

module.exports = XYChartView
