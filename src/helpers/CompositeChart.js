/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as Components from 'components'
import * as Composites from 'composites'
import * as Providers from 'providers'
import * as Actions from 'actions'
import actionman from 'core/Actionman'
/**
 * Creates a chart as a composition of components or other compositions
*/
export default class CompositeChart {
  constructor (p) {
    this._components = []
    this.actionman = actionman
    this.setConfig(p)
  }

  setData (data) {
    if (!_.isArray(data)) return
    _(this._components)
      .filter(c => c.model)
      .each(c => c.setData(data) )
  }
  /**
   * Sets the configuration for this chart as a simple object.
   * Instantiate the required views if they do not exist yet, set their configurations otherwise.
   * Updating configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
   * calling setConfig on already rendered chart will update the chart.
   */
  setConfig (config = {}) {
    if (this._config) this.remove()
    this._config = _.cloneDeep(config)
    /**
     * Let's register actions here.
     * Doing this in the constructor causes actions to be registered for views which may not have setConfig invoked,
     * causing multiple chart instance scenarios having actions bound to registars not active in the dom.
     * Since action is singleton and some actions trigger on all registrar, we need to avoid above mentioned scenario.
     */
    _.each(Actions, action => actionman.set(action, this))

    // if config specified create common provider for all components to prepare (format) data just once
    if (config.provider && config.provider.type) {
      const Provider = Providers[config.provider.type + 'Provider']
      if (Provider) this._provider = new Provider(config.provider.config)
    }
  }
  /**
   * Get component by id
   * @param {String} id
   */
  get (id) {
    return _.find(this._components, {id: id})
  }
  /**
   * @param {String} type
   * @return {Array} of components
   */
  getByType (type) {
    return _.filter(this._components, {type: type})
  }
  /**
   * Initialize individual component
   * @param {String} type
   * @param {Object} config
   * @param {Object} providerConfig
   * @param {Provider} model optional for dependent components
   */
  add (p) {
    const {type, config} = p
    if (!_.isObject(config) || config.enable === false) return false
    const Component = Components[type + 'View'] || Composites[type + 'View']

    // Share first initialized provider with all other components
    //if (!this._provider) this._provider = model
    //model = model || this._provider

    const component = new Component(p)
    this._components.push(component)

    return component
  }

  render () {
    _.each(this._components, component => component.render())
  }
  /**
   * Removes chart view and its components.
   * All actions will be unregistered, individual components will be removed except the parent container.
   */
  remove (id) {
    if (id) {
      const component = this.get(id)
      this._components = _.without(this._components, component)
      return component.remove()
    }
    _.each(Actions, action => actionman.unset(action, this))
    _.each(this._components, component => component.remove())
    this._components = []
  }
  /**
   * Initialize configured components
   */
  _initComponents () {
    // Apply template
    this._container = this._config.container || document.querySelector('#' + this._config.id)
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
    _.each(independent, component => this.add(component))
    _.each(dependent, component => {
      const sourceComponent = this.getComponent(component.config.sourceComponent)
      const componentView = this.add(component, sourceComponent.model)
      componentView.config.parent = sourceComponent.config
    })
  }
}
