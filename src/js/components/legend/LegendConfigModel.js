/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const ContrailChartsConfigModel = require('contrail-charts-config-model')

const Self = ContrailChartsConfigModel.extend({
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
    const accessors = this._parent.getAccessors()
    return _.map(accessors, (accessor) => {
      return {
        label: this.getLabel(undefined, accessor),
        color: this._parent.getColor(accessor),
      }
    })
  }
})

module.exports = Self
