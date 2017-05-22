import _ from 'lodash'
import * as d3Scale from 'd3-scale'

export default {
  defaults: {
    colorScheme: d3Scale.schemeCategory20,
  },

  set (p = {}, value, options) {
    // consider another set signature
    if (!_.isObject(p)) p = {[p]: value}
    else options = value

    if (p.colorScheme && !p.colorScale) p.colorScale = d3Scale.scaleOrdinal(p.colorScheme)
    return p
  },
  /**
   * @param {Object} data to extract color from
   * @param {Object} config on how to extract color from data
   * TODO should the getColor function if provided be evaluated on empty data?
   * Legend Panel needs to display a color not for particular data point but for the whole serie
   */
  getColor (data, config = {}) {
    const getColor = config.color
    if (_.isString(getColor)) return getColor
    if (_.isNil(data)) return undefined
    if (_.isFunction(getColor)) return getColor(data)
  }
}
