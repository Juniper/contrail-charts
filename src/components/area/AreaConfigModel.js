/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import * as d3Array from 'd3-array'
import * as d3Shape from 'd3-shape'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
import ScalableChart from 'helpers/scale/ScalableChart'

export default class AreaConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults,
      ColoredChart.defaults,
      {
        isSharedContainer: true,
        curve: d3Shape.curveCatmullRom.alpha(0.5),
      })
  }

  get yAccessors () {
    return _.filter(this.attributes.y, a => !(a.enabled === false))
  }

  get xScale () {
    return this.get('x.scale')
  }

  get yScale () {
    return this.get('y.scale')
  }

  set (...args) {
    ColoredChart.set(...args)
    super.set(...args)
  }

  getOuterWidth (model, width) {
    return ScalableChart.outerWidth(width, model, this.get('x.accessor'), this.get('x.scale'))
  }
  /**
   * @param model
   * @param width
   * @param height
   */
  calculateScales (model, width, height) {
    let config = _.extend({range: [0, width]}, this.attributes.x)
    _.set(this.attributes, 'x.scale', ScalableChart.getScale(model, config))

    const stackGroups = _.groupBy(this.yAccessors, 'stack')
    const totalDomainValues = _.reduce(stackGroups, (totalDomainValues, accessors) => {
      const stackedDomain = _.reduce(accessors, (stackedDomain, accessor) => {
        const range = model.getRangeFor(accessor.accessor)
        // Summarize ranges for stacked layers
        return [stackedDomain[0] + range[0], stackedDomain[1] + range[1]]
      }, [0, 0])
      // Get min / max extent for non-stacked layers
      return totalDomainValues.concat(stackedDomain)
    }, [0, 0])
    const domain = d3Array.extent(totalDomainValues)
    config = { range: [height, 0], domain }
    _.set(this.attributes, 'y.scale', ScalableChart.getScale(model, config))
  }

  getColor (accessorName) {
    const configured = _.find(this.yAccessors, {accessor: accessorName}).color
    return configured || this.attributes.colorScale(accessorName)
  }
}
