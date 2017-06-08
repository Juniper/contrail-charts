/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../../../core/Action'

export default class Cluster extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (...args) {
    let ids = args.length > 1 ? args.shift() : null
    if (!_.isNil(ids) && !_.isArray(ids)) ids = [ids]
    if (!ids || ids.includes(this._registrar.id)) this._registrar.cluster(...args)
  }
}
