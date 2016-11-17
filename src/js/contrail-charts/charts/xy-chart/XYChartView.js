define([
  'jquery', 'underscore',
  'contrail-charts-events',
  'contrail-charts-data-model',
  'contrail-view', // Todo use contrail-charts-view instead?
  'contrail-charts/components/index',
  'contrail-charts/handlers/index'
], function (
  $, _,
  Events,
  ContrailChartsDataModel,
  ContrailView,
  components,
  handlers
) {
  /**
  * Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
  * Many different Y axis may be configured.
  */
  var XYChartView = ContrailView.extend({
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

      if (self._isEnabledComponent('navigation')) {
        // Data aware components should use model of Navigation component
        var dataModel = self._components.navigation.getFocusDataProvider()
        if (self._components.xyChart) self._components.xyChart.changeModel(dataModel)
      }
      if (self._isEnabledComponent('radialChart')) {
        // We only need to change the data model when the navigation view is enabled so the line below is probably not needed.
        // self._components.radialChart.changeModel(self._dataProvider)
      }

      if (self._isEnabledComponent('bindingHandler') && !self.hasExternalBindingHandler) {
        // Only start the binding handler if it is not an external one.
        // Otherwise assume it will be started by the parent chart.
        self.bindingHandler.start()
      }
    },

    _isEnabledComponent: function (name) {
      var self = this
      var enabled = false
      if (_.isObject(self._config[name])) {
        if (self._config[name].enabled !== false) {
          enabled = true
        }
      }
      return enabled
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

    render: function () {
      var self = this
      _.each(self._components, function (component) {
        component.render()
      })
    }
  })

  return XYChartView
})
