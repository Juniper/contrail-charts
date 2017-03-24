/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class LegendConfigModel extends ContrailChartsConfigModel {
  getData (dataProvider) {
    if (this.attributes.dataType !== 'Serie') {
      const accessors = this._parent.getAccessors()
      return _.map(accessors, accessor => {
        return {
          label: this.getLabel(undefined, accessor),
          color: this._parent.getColor([], accessor),
        }
      })
    } else {
      // Ask parent component for labels and not dataProvider directly as some data series may be filtered out
      const labels = this._parent.getLabels(dataProvider)
      return _.map(labels, label => {
        return {
          label: label,
          color: this._parent.getColor([], label),
        }
      })
    }
  }
}
