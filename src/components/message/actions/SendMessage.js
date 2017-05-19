/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../../../core/Action'

export default class SendMessage extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (msgObj) {
    this._registrar.show(msgObj)
  }
}
