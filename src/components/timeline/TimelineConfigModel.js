/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class TimelineConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.defaultsDeep(super.defaults, {
      isSharedContainer: true,

      // The component height
      height: 100,

      brushHandleHeight: 8,
      brushHandleScaleX: 1,
      brushHandleScaleY: 1.2,

      // Scale to transform values from percentage based selection to visual coordinates
      selectionScale: d3Scale.scaleLinear().domain([0, 100]),

      // The selection to use when first rendered [xMin%, xMax%].
      selection: [],
    })
  }

  get selectionRange () {
    this.attributes.selectionScale.range([this.attributes.xRange[0], this.attributes.xRange[1]])
    if (_.isEmpty(this.attributes.selection)) return []
    return [
      this.attributes.selectionScale(this.attributes.selection[0]),
      this.attributes.selectionScale(this.attributes.selection[1]),
    ]
  }
}
