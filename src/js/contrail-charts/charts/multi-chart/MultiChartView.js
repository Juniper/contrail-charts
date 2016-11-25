/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var ContrailView = require('contrail-view') // Todo use contrail-charts-view instead
var XYChartView = require('contrail-charts/charts/xy-chart/XYChartView')
var BindingHandler = require('contrail-charts/handlers/BindingHandler')

var ChartView = ContrailView.extend({
  initialize: function () {
    var self = this
    self.charts = {}
  },

  /**
  * Data can be set separately into every chart so every chart can have different data.
  */
  setData: function (data, dataConfig, chartId) {
    var self = this
    dataConfig = dataConfig || {}
    chartId = chartId || 'default'
    // Set data to the given chart if it exists.
    if (self.charts[chartId]) self.charts[chartId].setData(data, dataConfig)
  },

  /**
  * Sets the config for all charts that can be part of this parent chart.
  * This config needs to be set before setData because when setting data we need the sub chart to be already defined in order to set data into it.
  */
  setConfig: function (config) {
    var self = this
    self.chartConfig = config
    self.componentInit()
  },

  /**
  * Instantiate the required views (sub charts) if they do not exist yet, set their configurations otherwise.
  */
  componentInit: function () {
    var self = this
    // Create a global binding handler if defined in config.
    if (self.isEnabledComponent('bindingHandler')) {
      if (!self.bindingHandler) {
        self.bindingHandler = new BindingHandler(self.chartConfig.bindingHandler)
      } else {
        self.bindingHandler.set(self.chartConfig.bindingHandler)
      }
    }
    // Iterate through the self.chartConfig.charts array, initialize the given charts, set their binding handle and config.
    _.each(self.chartConfig.charts, function (chartConfig) {
      if (chartConfig.chartId) {
        if (!self.charts[chartConfig.chartId]) {
          self.charts[chartConfig.chartId] = new XYChartView()
        }
        if (self.isEnabledComponent('bindingHandler')) {
          self.charts[chartConfig.chartId].setBindingHandler(self.bindingHandler)
        }
        self.charts[chartConfig.chartId].setConfig(chartConfig)
      }
    })
    if (self.isEnabledComponent('bindingHandler')) {
      self.bindingHandler.start()
    }
  },

  isEnabledComponent: function (configName) {
    var self = this
    var enabled = false
    if (_.isObject(self.chartConfig[configName])) {
      if (self.chartConfig[configName].enable !== false) {
        enabled = true
      }
    }
    return enabled
  },

  render: function () {
    var self = this
    _.each(self.charts, function (chart) {
      chart.render()
    })
  }
})

module.exports = ChartView
