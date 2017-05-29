/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'

export default class FilterConfigModel extends ConfigModel {
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
