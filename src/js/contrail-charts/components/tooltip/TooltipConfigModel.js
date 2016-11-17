/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var TooltipConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    generateTooltipHTML: function (data, accessor, tooltipConfig) {
      var tooltipElement = $('<div></div>')
      tooltipElement.addClass('tooltip-content')
      if (accessor.label) {
        var tooltipTitle = $('<div></div>')
        tooltipTitle.addClass('tooltip-title')
        tooltipTitle.append(accessor.label)
        tooltipElement.append(tooltipTitle)
      }
      _.each(tooltipConfig.data, function (d) {
        var tooltipItem = $('<div></div>')
        tooltipItem.addClass('tooltip-item')
        tooltipItem.append('<span class="tooltip-item-label">' + d.labelFormatter(data[d.accessor]) + ':</span>')
        tooltipItem.append('<span class="tooltip-item-value">' + d.valueFormatter(data[d.accessor]) + '</span>')
        tooltipElement.append(tooltipItem)
      })
      return tooltipElement
    }
  }
})

module.exports = TooltipConfigModel
