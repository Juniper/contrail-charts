/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../core/Action'

export default class Refresh extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, color) {
    const config = this._registrar.config
    if (config) config.trigger('change', config)
  }
}
