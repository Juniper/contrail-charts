/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsDataModel = require('contrail-charts-data-model')
var ContrailChartsView = require('contrail-charts-view')
var components = require('components/index')
var handlers = require('handlers/index')
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
var XYChartView = ContrailChartsView.extend({
  type: 'XYChartView',

  initialize: function (options) {
    var self = this
    self.hasExternalBindingHandler = false
    self._dataModel = new ContrailChartsDataModel()
    self._dataProvider = new handlers.DataProvider({ parentDataModel: self._dataModel })
    self._components = []
    options = options || {}
    self._eventObject = options.eventObject || _.extend({}, Events)
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
  // Todo deprecate setDataConfig. DataModel parser will be set as input parser in dataProvider config.
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
    self.setElement(config.container)
    if (!self._config.chartId) {
      self._config.chartId = 'XYChartView'
    }
    // Todo make dataConfig part of handlers? as dataProvider
    if (self._config.dataConfig) self.setDataConfig(self._config.dataConfig)
    self._initHandlers()
    self._initComponents()
  },

  getComponent: function (id) {
    return _.find(this._components, {id: id})
  },

  getComponentByType: function (type) {
    var self = this
    return _.find(self._components, {type: type})
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

  _initComponents: function () {
    var self = this
    var dataModel
    _.each(self._config.components, function (component, index) {
      component.config.order = index
      self._registerComponent(component.type, component.config, self._dataProvider, component.id)
    })
    if (self._isEnabledComponent('navigation')) {
      dataModel = self.getComponentByType('navigation').getFocusDataProvider()
      if (self._isEnabledComponent('compositeY')) self.getComponentByType('compositeY').changeModel(dataModel)
    }
    if (self._isEnabledComponent('timeline')) {
      dataModel = self.getComponentByType('timeline').getFocusDataProvider()
      if (self._isEnabledComponent('compositeY')) self.getComponentByType('compositeY').changeModel(dataModel)
    }
    if (self._isEnabledComponent('crosshair')) {
      /*
      // If crosshair component is activated then do not react on other tooltips
      // No need to hardcode this. If user does not want to mix tooltip with crosshair the should not include tooltip in plot config.
      var crosshairComponent = self.getComponentByType('crosshair')
      if (crosshairComponent.config.get('tooltip')) {
        var tooltipComponents = _.filter(self._components, { type: 'tooltip' })
        _.each(tooltipComponents, function(tooltipComponent) {
          tooltipComponent.params.acceptFilters.push(crosshairComponent.config.get('tooltip'))
        })
      }
      */
    }
    if (self._isEnabledComponent('legend')) {
      var legend = self.getComponentByType('legend')
      var sourceComponent = self.getComponent(legend.config.get('sourceComponent'))
      legend.config.setParent(sourceComponent.config)
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
      eventObject: self._eventObject,
      container: self.$el,
    })
    var component = new components[type].View(viewOptions)
    self._components.push(component)

    if (self._isEnabledHandler('bindingHandler') || self.hasExternalBindingHandler) {
      self.bindingHandler.addComponent(self._config.chartId, type, component)
    }
    return component
  },

  renderMessage: function (msgObj) {
    this._eventObject.trigger('message', msgObj)
  },

  clearMessage: function (componentId) {
    // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
    var msgObj = {
      componentId: componentId,
      action: 'update',
      messages: []
    }
    this._eventObject.trigger('message', msgObj)
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
    _.each(self._components, function (component) {
      component.render()
    })
  }
})

module.exports = XYChartView
