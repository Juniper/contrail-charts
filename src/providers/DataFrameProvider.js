/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import Events from 'contrail-events'
/**
 * Data preparation
 */
export default class DataFrameProvider {
  constructor (data, config) {
    this.data = data
    this.config = config
    this._ranges = {}
  }

  get data () {
    return this._data
  }

  set data (data) {
    this._data = this.parse(data) || []
    this._ranges = {}
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
  /**
   * Calculate and cache range of a serie
   * @param {String} accessor - serie accessor
   * @param {Boolean} isFull if true get range of the whole data, not just selection
   * @return {Array} [min, max] extent of values of the serie
   */
  getRangeFor (accessor, isFull) {
    if (isFull) return d3Array.extent(this._data, d => _.get(d, accessor))

    if (!_.has(this._ranges, accessor)) {
      this._ranges[accessor] = d3Array.extent(this._data, d => _.get(d, accessor))
    }
    return _.clone(this._ranges[accessor])
  }
  /**
   * @return {Array} [min, max] values of provided series values combined
   */
  combineDomains (accessors) {
    const domains = _.map(accessors, accessor => {
      return this.getRangeFor(accessor)
    })
    return d3Array.extent(_.concat(...domains))
  }
  /**
   * Limited to ascending sorted values
   */
  getNearest (accessor, value) {
    const data = this._data
    const xBisector = d3Array.bisector(d => _.get(d, accessor)).left
    const index = xBisector(data, value, 1, data.length - 1)
    return value - _.get(data[index - 1], accessor) > _.get(data[index], accessor) - value ? data[index] : data[index - 1]
  }
  /**
   * Filter out dataframes which have no provided key or its value is not within provided range
   * @param {String} key - serie accessor to filter dataframes by
   * @param {Array} range - [min, max] values of a serie
   */
  filter (key, range) {
    return _.filter(this._data, d => {
      return _.has(d, key) && d[key] >= range[0] && d[key] <= range[1]
    })
  }
  /**
   * Utility function to filter data by inclusion of dataframe inside provided ranges
   * @param {Object[]} data
   * @param {Object} ranges
   * @param {Object[]} ranges.keys
   */
  filterByRanges (data, ranges) {
    return _.filter(data, d => {
      let pass = true
      let i = 0
      const keys = ranges.keys()
      while (pass && i < keys.length) {
        const key = keys[i]
        pass = _.has(d, key) && d[key] >= ranges[key][0] && d[key] <= ranges[key][1]
        i++
      }
    })
  }
}
// TODO replace with class extends syntax
_.extend(DataFrameProvider.prototype, Events)
