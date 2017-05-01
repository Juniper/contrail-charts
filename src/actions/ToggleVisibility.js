/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class ToggleVisibility extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (ids, isVisible, ...args) {
    _.isArray(ids) || (ids = [ids])
    _.each(ids, id => {
      if (this._registrar.id === id) {
        isVisible ? this._registrar.show(...args) : this._registrar.hide(...args)
      }
    })
  }
}
