/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var Self = ContrailChartsConfigModel.extend({
  setParent: function (model) {
    var self = this
    self._parent = model
    model.on('change', function () {
      self.trigger('change')
    })
  },
  /**
   * Ask parent component for labels and not dataProvider directly as some data series may be filtered out
   */
  getData: function (dataProvider) {
    var self = this
    var labels = self._parent.getLabels(dataProvider)
    return _.map(labels, function (label) {
      return {
        label: label,
        color: self._parent.getColor(label),
      }
    })
  }
})

module.exports = Self
