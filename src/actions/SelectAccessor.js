/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../core/Action'

export default class SelectAccessor extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, isSelected) {
    this._registrar.config.setAccessor(accessorName, isSelected)
  }
}
