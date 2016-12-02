/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var ColorPickerConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    sourceComponent: 'compositeY',
    palette: d3.schemeCategory20,
    generateColorPickerHTML: function (accessors) {
      var $container = $('<div></div>')
      _.each(accessors, function (accessor) {
        var $row = $('<div class="color-select" style="background-color: ' + accessor.color + '" data-accessor="' + accessor.accessor + '"></div>')
        $row.append('<span class="label">' + (accessor.label || accessor.accessor) + '</span>')
        $container.append($row)
      })
      return $container
    }
  }
})

module.exports = ColorPickerConfigModel
