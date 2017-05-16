/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../core/Action'
/**
 * fired to stop updating component by setData
 */
export default class ToggleHalt extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (toggle) {
    if (this._registrar.config) this._registrar.setHalt(toggle)
  }
}
