/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'
/**
 * fired to stop updating component by setData
 */
export default class Browse extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (ids, toggle, attribute) {
    _.isArray(ids) || (ids = [ids])
    _.each(ids, id => {
      if (this._registrar.id === id) {
        this._registrar.browse(attribute)
      }
    })
  }
}
