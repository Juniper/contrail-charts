/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class BrushConfigModel extends ContrailChartsConfigModel {
  /**
   * Brush selection in percentage [xMin%, xMax%]
   */
  get selection () {
    return this.attributes.selection || []
  }

  get handleHeight () {
    return this.has('handleHeight') ? this.attributes.handleHeight : 16
  }

  get handleCenter () {
    return this.attributes.yRange[1] / 2 + this.attributes.yRange[0] / 2
  }

  get extent () {
    return [
      [this.attributes.xRange[0], this.attributes.yRange[1]],
      [this.attributes.xRange[1], this.attributes.yRange[0]],
    ]
  }
}
