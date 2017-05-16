/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Events from 'contrail-events'
/**
 * Base data model.
 */
export default class DataModel {
  constructor (data, config) {
    this.data = data
    this.config = config
  }

  get data () {
    return this._data
  }

  set data (data) {
    this._data = this.parse(data) || []
    this.trigger('change')
  }

  get type () {
    return this.constructor.name.slice(0, -5)
  }

  set config ({formatter} = {}) {
    if (!formatter) return
    this._formatter = formatter
    this.trigger('change')
  }

  parse (data) {
    return _.isFunction(this._formatter) ? this._formatter(data) : data
  }

}
// TODO replace with class extends syntax
_.extend(DataModel.prototype, Events)
