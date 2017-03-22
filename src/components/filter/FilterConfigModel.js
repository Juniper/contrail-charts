/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class FilterConfigModel extends ContrailChartsConfigModel {
  get data () {
    const accessors = this._parent.getAccessors()
    const data = _.map(accessors, (accessor) => {
      return {
        key: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        enabled: accessor.enabled,
      }
    })
    return data
  }
}
