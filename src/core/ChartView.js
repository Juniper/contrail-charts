/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as Components from 'components/index'
import * as Providers from 'providers/index'
import * as Actions from 'actions/index'
import TitleView from 'helpers/title/TitleView'
import actionman from 'core/Actionman'
/**
*/
export default class ChartView {
  constructor (p) {
    this._components = []
  }
  /**
  * Provide data for this chart as a simple array of objects.
  */
  setData (data) {
    if (this.frozen) return
    if (!_.isArray(data)) return
    _(this._components)
      .map(c => c.model)
      .uniq()
      .compact()
      .each(m => { m.data = data })
  }
  /**
   * Sets the configuration for this chart as a simple object.
   * Instantiate the required views if they do not exist yet, set their configurations otherwise.
   * Updating configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
   * calling setConfig on already rendered chart will reset the chart.
   */
  setConfig (config) {
    if (this._config) this.remove()
    this._config = _.cloneDeep(config)
    /**
     * Let's register actions here.
     * Doing this in the constructor causes actions to be registered for views which may not have setConfig invoked,
     * causing multiple chart instance scenarios having actions bound to registars not active in the dom.
     * Since action is singleton and some actions trigger on all registrar, we need to avoid above mentioned scenario.
     */
    _.each(Actions, action => actionman.set(action, this))

    // create common provider for all components to prepare (format) data just once
    if (config.provider && config.provider.type) {
      this._provider = new [`${config.provider.type}Provider`](config.provider.config)
    }
    this._initComponents()
  }
  /**
   * Get component by id
   * @param {String} id
   */
  getComponent (id) {
    return _.find(this._components, {id: id})
  }
  /**
   * Get array of components by type
   * @return {Array}
   */
  getComponentsByType (type) {
    return _.filter(this._components, {type: type})
  }

  render () {
    _.each(this._components, (component) => {
      component.render()
    })
  }
  /**
   * Removes chart view and its components.
   * All actions will be unregistered, individual components will be removed except the parent container.
   */
  remove () {
    _.each(Actions, action => actionman.unset(action, this))
    _.each(this._components, component => component.remove())
    this._components = []
  }

  renderMessage (msgObj) {
    actionman.fire('SendMessage', msgObj)
  }

  clearMessage (componentId) {
    // To clear messages for a given component we send a message with 'update' action and an empty array of messages.
    const msgObj = {
      componentId: componentId,
      action: 'update',
      messages: [],
    }
    actionman.fire('ClearMessage', msgObj)
  }
  /**
   * Initialize configured components
   */
  _initComponents () {
    // Apply template
    this._container = document.querySelector('#' + this._config.id)
    if (this._config.template) {
      const template = document.createElement('template')
      template.innerHTML = this._config.template()
      // some components require container to have id
      _.each(template.content.querySelectorAll(`[component]`), el => {
        el.setAttribute('id', 'cc-' + el.getAttribute('component'))
      })
      this._container.append(document.importNode(template.content, true))
    }
    if (this._config.title) TitleView(this._container, this._config.title)

    _.each(this._config.components, (component, index) => {
      component.config.order = index
      component.config.id = component.id
    })
    const [dependent, independent] = _.partition(this._config.components, c => c.config.sourceComponent)
    _.each(independent, component => this._registerComponent(component))
    _.each(dependent, component => {
      const sourceComponent = this.getComponent(component.config.sourceComponent)
      const componentView = this._registerComponent(component, sourceComponent.model)
      componentView.config.parent = sourceComponent.config
    })
  }
  /**
   * Initialize individual component
   * @param {String} type
   * @param {Object} config
   * @param {Object} providerConfig
   * @param {Provider} model optional for dependent components
   */
  _registerComponent ({type, config, provider: providerConfig}, model) {
    if (!this._isEnabledComponent(type)) return false
    const Component = Components[type + 'View']
    const ConfigModel = Components[type + 'ConfigModel']
    const Provider = Providers[Component.dataType + 'Provider']

    let configModel
    if (ConfigModel) configModel = new ConfigModel(config)
    const container = this._container.querySelector(`[component="${config.container || config.id}"]`)
    model = model || this._provider
    if (Provider && (!model || providerConfig)) model = new Provider(null, providerConfig)

    // Share first initialized provider with all other components
    if (!this._provider) this._provider = model
    const viewOptions = {
      id: config.id,
      config: configModel,
      model: model,
      container: container || this._container,
    }
    const component = new Component(viewOptions)
    this._components.push(component)

    return component
  }

  _isEnabled (config, type) {
    const foundConfig = _.find(config, {type: type})
    if (!foundConfig) return false
    if (_.isObject(foundConfig.config)) {
      return !(foundConfig.config.enable === false)
    }
    return false
  }

  // TODO this is not enough specific
  _isEnabledComponent (type) {
    return this._isEnabled(this._config.components, type)
  }
}
