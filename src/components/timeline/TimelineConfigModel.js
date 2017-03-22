/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class NavigationConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, {
      // The chart width. If not provided will be caculated by View.
      chartWidth: undefined,

      // The difference by how much we want to modify the computed width.
      chartWidthDelta: undefined,

      // The chart height. If not provided will be caculated by View.
      chartHeight: undefined,

      // General margin used for computing the side margins.
      margin: 30,

      // Side margins. Will be computed if undefined.
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 30,
      marginRight: 30,
      marginInner: 30,

      brushHandleHeight: 8,
      brushHandleScaleX: 1,
      brushHandleScaleY: 1.2,

      // The selection to use when first rendered [xMin%, xMax%].
      selection: [0, 100],
    })
  }
}
