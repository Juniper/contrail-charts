/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../core/Action'

export default class SelectColor extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }
  /**
   * Dependent components like Color Picker or Legend Panel will be updated by parent config model triggering 'change' event
   */
  _execute (accessorName, color) {
    this._registrar.config.setColor(accessorName, color)
  }
}
