/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as Components from 'components'
import * as Composites from 'composites'
/**
 * Creates a chart as a composition of components or other compositions
 */
export default class CompositeChart {
  constructor (p) {
    this._components = []
    this.setConfig(p)
  }

  setData (data) {
    if (!_.isArray(data)) return
    _(this._components)
      .filter(c => c.model)
      .uniqBy(c => c.model)
      .each(c => c.setData(data))
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
    _.isArray(type) || (type = [type])
    return _.filter(this._components, component => type.includes(component.type))
  }
  /**
   * Initialize individual component
   * @param {String} type
   * @param {Object} config
   * @param {Model} p.model optional for dependent components
   */
  add (p) {
    const {type, config} = p
    if (!_.isObject(config) || config.enable === false) return false
    const Component = Components[type + 'View'] || Composites[type + 'View']
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
    _.each(this._components, component => component.remove())
    this._components = []
  }
}
