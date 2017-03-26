/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailModel from 'contrail-model'

export default class ContrailChartsConfigModel extends ContrailModel {
  constructor (p = {}) {
    super(p)
  }

  get defaults () {
    return {
      duration: 300,
    }
  }
  /**
   * @return {String} this class name without 'ConfigModel'
   */
  get type () {
    return this.constructor.name.slice(0, -11)
  }
  /**
  * Initialize the computed parameters with the config parameters.
  */
  computeParams () {
    this._computed = {}
    return _.extend(this._computed, JSON.parse(JSON.stringify(this.toJSON())))
  }

  set parent (model) {
    model.on('change', () => { this.trigger('change') })
    this._parent = model
    this.trigger('change')
  }
  /**
   * @param {Object} data to extract value from
   * @param {Object} config on how to extract
   */
  getValue (data, config = {}) {
    const getValue = config.accessor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getValue)) return getValue(data)
    if (_.isString(getValue)) return _.get(data, getValue)
    return data
  }
  /**
   * @param {Object} data to extract formatted value from
   * @param {Object} config on how to extract
   */
  getFormattedValue (data, config = {}) {
    const formatter = config.valueFormatter
    const value = this.getValue(data, config)
    if (_.isFunction(formatter)) return formatter(value)
    return value
  }
  /**
   * @param {Object} data to extract label from
   * @param {Object} config on how to extract label from data
   */
  getLabel (data, config = {}) {
    const getLabel = config.labelFormatter || config.label || config.accessor || config.getLabel
    if (_.isString(getLabel)) return getLabel
    if (_.isNil(data)) return undefined
    if (_.isFunction(getLabel)) return getLabel(data)
  }

  getAction (selector, type) {
    return this.get(`action.${type} ${selector}`)
  }

  hasAction (selector, type) {
    const actions = _.filter(this.attributes.action, (action, key) => key.includes(selector))
    return _.isFunction(actions[0])
  }
}
