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

  getComponentByType: function (type) {
    var self = this
    return _.find(self._components, {type: type})
  },

  _initComponents: function () {
    var self = this
    _.each(self._config.components, function (component) {
      if (component.type === 'bindingHandler' && self._isEnabledComponent('bindingHandler')) {
        if (!self.bindingHandler) {
          self.bindingHandler = new handlers.BindingHandler(self._config.bindingHandler)
        } else {
          self.bindingHandler.addBindings(self._config.bindingHandler.bindings, self._config.chartId)
        }
        return
      }
      self._registerComponent(component.type, component.config, self._dataProvider, component.id)
    })
    if (self._isEnabledComponent('radialChart')) {
      self.getComponentByType('radialChart').changeModel(self._dataProvider)
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

module.exports = RadialChartView
