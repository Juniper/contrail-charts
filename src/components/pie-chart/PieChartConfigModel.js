/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class PieChartConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, ColoredChart.defaults, {
      // sets the position for shared svg container
      isPrimary: true,

      // The component width. If not provided will be caculated by View.
      width: undefined,

      // The component height. If not provided will be caculated by View.
      height: undefined,
    })
  }

  get innerRadius () {
    const chartType = this.get('type')
    const innerRadiusCoefficient = chartType === 'pie' ? 0 : 0.75
    return this.get('radius') * innerRadiusCoefficient
  }

  set (...args) {
    super.set(ColoredChart.set(...args))
  }

  getColor (data, accessor) {
    const configuredColor = ColoredChart.getColor(data, accessor)
    return configuredColor || this.attributes.colorScale(accessor)
  }

  getLabels (dataProvider) {
    const labelFormatter = this.get('serie').getLabel
    return dataProvider.getLabels(labelFormatter)
  }
}
