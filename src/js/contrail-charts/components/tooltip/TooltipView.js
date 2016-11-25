/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var TooltipView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-tooltip-view',

  initialize: function (options) {
    var self = this
    self.show = 0
    self.config = options.config
    self.listenTo(self.config, 'change', self.render)
    self.eventObject = options.eventObject || _.extend({}, Events)
    self.listenTo(self.eventObject, 'showTooltip', self.showTooltip)
    self.listenTo(self.eventObject, 'hideTooltip', self.hideTooltip)
  },

  generateTooltipHTML: function (data, accessor) {
    var tooltipConfig = {}
    var fnGenerateTooltipHTML = this.config.get('generateTooltipHTML')
    if (accessor.tooltip) {
      tooltipConfig = this.config.get(accessor.tooltip)
      if (_.isFunction(tooltipConfig.generateTooltipHTML)) {
        fnGenerateTooltipHTML = tooltipConfig.generateTooltipHTML
      }
    }
    return fnGenerateTooltipHTML(data, accessor, tooltipConfig)
  },

  showTooltip: function (tooltipData, offsetLeft, offsetTop, accessor) {
    var self = this
    self.show++
    var tooltipElement = $(self.generateTooltipHTML(tooltipData, accessor))
    $('body').append(self.$el)
    self.$el.html(tooltipElement)
    self.$el.show()

    // Tooltip dimmensions will be available after render.
    var tooltipWidth = tooltipElement.outerWidth()
    var tooltipHeight = tooltipElement.outerHeight()
    var windowWidth = $(document).width()
    var tooltipPositionTop = offsetTop - tooltipHeight - 10
    var tooltipPositionLeft = offsetLeft
    if (tooltipPositionTop < 0) {
      tooltipPositionTop = 0
    }
    if ((offsetLeft + tooltipWidth + 15) > windowWidth) {
      tooltipPositionLeft = windowWidth - (offsetLeft + tooltipWidth + 15)
    }
    $(tooltipElement).css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft
    })
  },

  hideTooltip: function (d, x, y) {
    var self = this
    self.show--
    _.delay(function () {
      if (self.show <= 0) {
        self.$el.hide()
      }
    }, 1000)
  },

  render: function () {
    var self = this
    self.resetParams()
  }
})

module.exports = TooltipView
