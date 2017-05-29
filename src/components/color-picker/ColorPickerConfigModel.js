/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class ColorPickerConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults)
  }
  /**
   * Ask parent component for serie accessors
   */
  get data () {
    const data = {colors: this.attributes.colorScheme}
    const accessors = this._parent.yAccessors
    data.series = _.map(accessors, accessor => {
      return {
        accessor: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor.accessor),
      }
    })
    return data
  }
}
