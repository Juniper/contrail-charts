/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import Action from '../../../core/Action'

export default class SelectChartType extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (...args) {
    this._registrar.config.setChartType(...args)
  }
}
