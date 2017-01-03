/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const $ = require('jquery')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./legend.html')

const Self = ContrailChartsView.extend({
  type: 'legend',
  className: 'coCharts-legend-view',

  initialize: function (options) {
    ContrailChartsView.prototype.initialize.call(this, options)
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this.render)
  },

  render: function () {
    this.$el.addClass(this.className)
    const template = this.config.get('template') || _template
    const content = $(template(this.config.getData(this.model)))

    ContrailChartsView.prototype.render.call(this, content)
  }
})

module.exports = Self
