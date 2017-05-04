/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class NavigationConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults, {
      // Scale to transform values from percentage based selection to visual coordinates
      selectionScale: d3Scale.scaleLinear().domain([0, 100]),

      margin: {
        top: 25,
        left: 50,
        right: 50,
        bottom: 40,
        label: 16,
      },

      curve: d3Shape.curveCatmullRom.alpha(0.5),

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

  getColor (accessorName) {
    const configured = _.find(this.yAccessors, {accessor: accessorName}).color
    return configured || this.attributes.colorScale(accessorName)
  }
}
