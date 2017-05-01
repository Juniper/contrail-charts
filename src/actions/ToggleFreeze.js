/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../core/Action'

export default class ToggleFreeze extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (toggle) {
    if (this._registrar.config) this._registrar.config.set('frozen', toggle)
  }
}
