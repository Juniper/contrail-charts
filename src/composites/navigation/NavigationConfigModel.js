/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import ConfigModel from 'config-model'

export default class NavigationConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, {
      // Scale to transform values from percentage based selection to visual coordinates
      selectionScale: d3Scale.scaleLinear().domain([0, 100]),

      // The selection to use when first rendered [xMin%, xMax%].
      selection: [],

      // How much to move the brush on browse action (1 minute).
      browseMoveBy: 60000,

      // Following is translated to internal yChart
      margin: {
        top: 8,
        left: 8,
        bottom: 8,
        right: 8,
        label: 16,
      },
      plot: {
        x: {
          // This should not be changed
          axis: 'x',
        },
        y: {
          // This should not be changed
          axis: 'y',
        }
      },
      axes: {
        x: {},
        y: {},
      },
    })
  }

  /**
  * Returns the selection in pixels.
  * Uses the pixelSelection if available as it is exactly what user selected.
  * The selection is given in percent and may not change even if user moved the brush.
  * Will recompute pixelSelection from selection if xRange changed (window resized).
  */
  getSelectionRange (xRange) {
    const scale = this.attributes.selectionScale
    const selection = this.attributes.selection
    const pixelSelection = this.attributes.pixelSelection
    const previousXRange = this.attributes.xRange
    if (_.isEmpty(selection)) return []
    if (!pixelSelection || !previousXRange || !_.isEqual(previousXRange, xRange)) {
      scale.range(xRange)
      return [ Math.floor(scale(selection[0])), Math.ceil(scale(selection[1])) ]
    }
    return pixelSelection
  }
}
