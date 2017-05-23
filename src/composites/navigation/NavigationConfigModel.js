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

  getSelectionRange (xRange) {
    const scale = this.attributes.selectionScale
    const selection = this.attributes.selection
    scale.range(xRange)
    if (_.isEmpty(selection)) return []
    return [
      scale(selection[0]),
      scale(selection[1]),
    ]
  }
}
