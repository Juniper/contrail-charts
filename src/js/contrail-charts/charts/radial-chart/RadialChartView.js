/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsDataModel = require('contrail-charts-data-model')
var ContrailView = require('contrail-view') // Todo use contrail-charts-view instead?
var components = require('contrail-charts/components/index')
var handlers = require('contrail-charts/handlers/index')
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
var RadialChartView = ContrailView.extend({
  initialize: function (options) {
    var self = this
    self.hasExternalBindingHandler = false
    self._dataModel = new ContrailChartsDataModel()
    self._dataProvider = new handlers.DataProvider({ parentDataModel: self._dataModel })
    self._components = {}
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
    dataConfig = dataConfig || {}
    self._dataModel.set(dataConfig, { silent: true })

    if (_.isArray(data)) self._dataModel.setData(data)
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
      self._config.chartId = 'RadialChartView'
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
    _.each(self._config, function (config, name) {
      if (name === 'bindingHandler' && self._isEnabledComponent('bindingHandler')) {
        if (!self.bindingHandler) {
          self.bindingHandler = new handlers.BindingHandler(self._config.bindingHandler)
        } else {
          self.bindingHandler.addBindings(self._config.bindingHandler.bindings, self._config.chartId)
        }
        return
      }
      self._registerComponent(name, config, self._dataProvider)
    })
    if (self._components.radialChart) {
      self._components.radialChart.changeModel(self._dataProvider)
    }
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

module.exports = RadialChartView
