/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class Zoom extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }
  /**
   * Zoom is performed by accessor ranges for any updated component be able to respond
   * while zooming by axes will require components to have the same corresponding axes names
   * @param ranges Hash of ranges by accessor
   */
  _execute (ids, ...args) {
    if (!_.isNil(ids) && !_.isArray(ids)) ids = [ids]
    if (!ids || ids.includes(this._registrar.id)) this._registrar.zoom(...args)
  }
}
