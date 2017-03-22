/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class LegendConfigModel extends ContrailChartsConfigModel {
  /**
   * Ask parent component for labels and not dataProvider directly as some data series may be filtered out
   */
  getData (dataProvider) {
    const labels = this._parent.getLabels(dataProvider)
    return _.map(labels, (label) => {
      return {
        label: label,
        color: this._parent.getColor([], label),
      }
    })
  }
}
