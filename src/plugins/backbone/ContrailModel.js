/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Backbone from 'backbone'

export default class ContrailModel extends Backbone.Model {
  constructor (...args) {
    super(...args)
    this.attributes = _.defaultsDeep(this.attributes, this.defaults)
  }

  get (attr) {
    return _.get(this.attributes, attr)
  }

  set (key, value, options) {
    if (key == null) return this

    // Handle both `"key", value` and `{key: value}` -style arguments.
    let attrs
    if (typeof key === 'object') {
      attrs = key
      options = value
    } else {
      (attrs = {})[key] = value
    }

    options || (options = {})

    // Run validation.
    if (!this._validate(attrs, options)) return false

    // Extract attributes and options.
    const unset = options.unset
    const silent = options.silent

    // array of attribute names (keys)
    const changes = []
    const isChanging = this._isChanging
    this._isChanging = true

    if (!isChanging) {
      this._previousAttributes = _.clone(this.attributes)
      this.changed = {}
    }

    var current = this.attributes
    var changed = this.changed
    var prev = this._previousAttributes

    // For each `set` attribute, update or delete the current value.
    for (var attr in attrs) {
      value = _.get(attrs, attr)
      const currentValue = _.get(current, attr)
      if (!_.isEqual(currentValue, value)) changes.push(attr)
      if (!_.isEqual(_.get(prev, attr), value)) {
        _.set(changed, attr, value)
      } else {
        this.changed = _.omit(changed, attr)
      }
      if (unset) {
        this.attributes = _.omit(current, attr)
      } else {
        const newValue = _.isPlainObject(currentValue) ? _.extend(currentValue, value) : value
        _.set(current, attr, newValue)
      }
    }

    // Update the `id`.
    if (this.idAttribute in attrs) this.id = this.get(this.idAttribute)

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) this._pending = options
      for (var i = 0; i < changes.length; i++) {
        this.trigger('change:' + changes[i], this, current[changes[i]], options)
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (isChanging) return this
    if (!silent) {
      while (this._pending) {
        options = this._pending
        this._pending = false
        this.trigger('change', this, options)
      }
    }
    this._pending = false
    this._isChanging = false
    return this
  }

  // TODO override changedAttributes to support nested objects
}
