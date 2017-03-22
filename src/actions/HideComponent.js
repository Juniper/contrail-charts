/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class HideComponent extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (id, ...args) {
    const ids = _.isArray(id) ? id : [id]
    _.each(ids, id => {
      const component = this._registrar.getComponent(id)
      if (component) component.hide(...args)
    })
  }
}
