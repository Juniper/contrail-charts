/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'

export default class LegendConfigModel extends ConfigModel {
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
