/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

const ColorPickerConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    palette: d3.schemeCategory20,
  },

  setParent: function (model) {
    this._parent = model
    model.on('change', () => {
      this.trigger('change')
    })
  },
  /**
   * Ask parent component for serie accessors
   */
  getData: function () {
    const data = {colors: this.attributes.palette}
    const accessors = this._parent.getAccessors()
    data.series = _.map(accessors, (accessor) => {
      return {
        accessor: accessor.accessor,
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
      }
    })
    return data
  }
})

module.exports = ColorPickerConfigModel
