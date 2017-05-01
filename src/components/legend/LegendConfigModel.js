/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class LegendConfigModel extends ContrailChartsConfigModel {
  getData (dataProvider) {
    const accessors = this._parent.getAccessors(dataProvider)
    return _.map(accessors, accessor => {
      return {
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
      }
    })
  }
}
