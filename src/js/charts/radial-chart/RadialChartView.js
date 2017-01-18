/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const Events = require('contrail-charts-events')
const ContrailChartsDataModel = require('contrail-charts-data-model')
const ContrailView = require('contrail-view') // Todo use contrail-charts-view instead?
const components = require('components/index')
const handlers = require('handlers/index')
/**
* Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
* Many different Y axis may be configured.
*/
class Self extends ContrailView.extend({
  type: 'RadialChartView',
}) {
  constructor (options) {
    super()
    this.hasExternalBindingHandler = false
    this._dataModel = new ContrailChartsDataModel()
    this._dataProvider = new handlers.SerieProvider({ parent: this._dataModel })
    this._components = []
    options = options || {}
    this._eventObject = options.eventObject || _.extend({}, Events)
    this.listenTo(this._dataProvider, 'change', this._render)
  }

  render () {
    _.each(this._components, (component) => {
      component.render()
    })
    this._render()
  }
  /**
  * Provide data for this chart as a simple array of objects.
  * Additional ContrailChartsDataModel configuration may be provided.
  * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
  */
  setData (data, dataConfig) {
    dataConfig = dataConfig || {}
    this._dataModel.set(dataConfig, { silent: true })

    if (_.isArray(data)) this._dataModel.setData(data)
  }
  /**
  * Sets the configuration for this chart as a simple object.
  * Instantiate the required views if they do not exist yet, set their configurations otherwise.
  * Setting configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
  */
  setConfig (config) {
    this._config = config
    this.setElement(config.container)
    if (!this._config.chartId) {
      this._config.chartId = 'RadialChartView'
    }
    this._initComponents()
  }

  getComponent (id) {
    return _.find(this._components, {id: id})
  }
  // TODO should return all instances not first only
  getComponentByType (type) {
    return _.find(this._components, {type: type})
  }

  _initComponents () {
    _.each(this._config.components, (component, index) => {
      component.config.order = index
      if (component.type === 'bindingHandler' && this._isEnabledComponent('bindingHandler')) {
        if (!this.bindingHandler) {
          this.bindingHandler = new handlers.BindingHandler(this._config.bindingHandler)
        } else {
          this.bindingHandler.addBindings(this._config.bindingHandler.bindings, this._config.chartId)
        }
        return
      }
      this._registerComponent(component.type, component.config, this._dataProvider, component.id)
    })
    // set parent config model
    _.each(this._components, (component, index) => {
      const sourceComponentId = component.config.get('sourceComponent')
      if (sourceComponentId) {
        const sourceComponent = this.getComponent(sourceComponentId)
        component.config.setParent(sourceComponent.config)
      }
    })
    if (this._isEnabledComponent('radialChart')) {
      this.getComponentByType('radialChart').changeModel(this._dataProvider)
    }
  }

  _registerComponent (type, config, model, id) {
    if (!this._isEnabledComponent(type)) return false
    const configModel = new components[type].ConfigModel(config)
    const viewOptions = _.extend(config, {
      id: id,
      config: configModel,
      model: model,
      eventObject: this._eventObject,
      container: this.$el,
    })
    const component = new components[type].View(viewOptions)
    this._components.push(component)

    if (this._isEnabledComponent('bindingHandler') || this.hasExternalBindingHandler) {
      this.bindingHandler.addComponent(this._config.chartId, type, component)
    }
    return component
  }

  _isEnabledComponent (type) {
    const componentConfig = _.find(this._config.components, {type: type})
    if (!componentConfig) return false
    if (_.isObject(componentConfig.config)) {
      return !(componentConfig.config.enable === false)
    }
    return false
  }

  _render () {
    // TODO chart render function should be called after each component render for performance
  }
}

module.exports = Self
