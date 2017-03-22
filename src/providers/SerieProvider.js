/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Events from 'contrail-events'

export default class SerieProvider {
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

  set config ({formatter} = {}) {
    if (!formatter) return
    this._formatter = formatter
    this.trigger('change')
  }

  parse (data) {
    return _.isFunction(this._formatter) ? this._formatter(data) : data
  }

  getLabels (formatter) {
    return _.map(this._data, serie => formatter(serie))
  }
}
// TODO replace with class extends syntax
_.extend(SerieProvider.prototype, Events)
