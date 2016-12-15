/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsView = require('contrail-charts-view')
var _template = require('./tooltip.html')

var TooltipView = ContrailChartsView.extend({
  type: 'tooltip',
  tagName: 'div',
  className: 'coCharts-tooltip-view',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    self.listenTo(self.config, 'change', self.resetParams)
    self.listenTo(self._eventObject, 'showTooltip', self.show)
    self.listenTo(self._eventObject, 'hideTooltip', self.hide)
  },

  show: function (offset, data, id) {
    var self = this
    if (id && id !== self.id) return
    self.render(data)
    self.$el.show()

    // Tooltip dimmensions will be available after render.
    var tooltipWidth = self.$el.outerWidth()
    var tooltipHeight = self.$el.outerHeight()
    var windowWidth = $(document).width()
    var tooltipPositionTop = offset.top - tooltipHeight - 100
    var tooltipPositionLeft = offset.left
    if (tooltipPositionTop < 0) {
      tooltipPositionTop = 0
    }
    if ((offset.left + tooltipWidth + 15) > windowWidth) {
      tooltipPositionLeft = windowWidth - (offset.left + tooltipWidth + 15)
    } else {
      tooltipPositionLeft += 20
    }
    self.$el.css({
      top: tooltipPositionTop,
      left: tooltipPositionLeft
    })
  },

  hide: function () {
    var self = this
    self.$el.hide()
  },

  render: function (data) {
    var self = this
    if (!data) return
    var tooltipData = {}
    var dataConfig = self.config.get('dataConfig')
    var template = self.config.get('template') || _template
    tooltipData.items = _.map(dataConfig, function (datumConfig) {
      return {
        label: datumConfig.labelFormatter(data[datumConfig.label]),
        value: datumConfig.valueFormatter(data[datumConfig.accessor])
      }
    })
    tooltipData.title = self.config.get('title')
    var tooltipElement = $(template(tooltipData))

    ContrailChartsView.prototype.render.call(self, tooltipElement)
  }
})

module.exports = TooltipView
