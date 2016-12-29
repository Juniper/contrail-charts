/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var LegendConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    sourceComponent: 'compositeY',
    generateLegendHTML: function (accessors) {
      var self = this
      var $container = $('<div></div>')
      _.each(accessors, function (accessor) {
        var $row = $('<div class="legend-group"></div>')
        $row.append('<span class="color" style="background-color: ' + accessor.color + '">&nbsp;</span>')
        $row.append('<span class="label">' + self.getLabel(undefined, accessor) + '</span>')
        $container.append($row)
      })
      return $container
    }
  }
})

module.exports = LegendConfigModel
