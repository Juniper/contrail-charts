/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class PieConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.defaultsDeep(super.defaults, ColoredChart.defaults, {
      // sets the position for shared svg container
      isPrimary: true,

      margin: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
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
  /**
   * retrieves color by label in accessor OR by getLabel function from the data
   */
  getColor (data, accessor = {}) {
    accessor.color = datum => this.attributes.colorScale(accessor.label || this.getLabel(datum, this.attributes.serie))
    return ColoredChart.getColor(data, accessor)
  }
  /**
   * @return Array of Objects with labels which serve as accessors for values
   */
  getAccessors (dataProvider) {
    const labelFormatter = this.get('serie').getLabel
    return _.map(dataProvider.getLabels(labelFormatter), label => { return { label } })
  }
}
