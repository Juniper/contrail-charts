/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class LegendConfigModel extends ContrailChartsConfigModel {
  /**
   * Ask parent component for serie accessors
   */
  get data () {
    const accessors = this._parent.getAccessors()
    return _.map(accessors, (accessor) => {
      return {
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor([], accessor),
      }
    })
  }
}
