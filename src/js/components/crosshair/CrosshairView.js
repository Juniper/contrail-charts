/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')

const CrosshairView = ContrailChartsView.extend({
  type: 'crosshair',
  className: 'coCharts-crosshair-view',

  initialize: function (options) {
    ContrailChartsView.prototype.initialize.call(this, options)
    this.listenTo(this.config, 'change', this.render)
    this.render()
    this.listenTo(this._eventObject, 'showCrosshair', this.show)
    this.listenTo(this._eventObject, 'hideCrosshair', this.hide)
  },

  show: function (data, point, config) {
    if (!data) return this.hide()

    if (point[0] < config.x1 || point[0] > config.x2 || point[1] < config.y1 || point[1] > config.y2) {
      return this.hide()
    }
    const svg = this.svgSelection()
    // Draw crosshair line
    const svgCrosshair = svg.selectAll('.crosshair').data([config.line])
    const svgCrosshairEnter = svgCrosshair.enter().append('g')
      .attr('class', 'crosshair')
    svgCrosshairEnter.append('line')
      .attr('class', 'x-line')
      .attr('x1', (d) => d.x(data))
      .attr('x2', (d) => d.x(data))
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2)
    svgCrosshairEnter.append('text')
      .attr('class', 'x-text')
      .attr('x', (d) => d.x(data))
      .attr('y', (d) => d.y1 + 15)
      .text((d) => d.text(data))
    svgCrosshairEnter.append('g')
      .attr('class', 'bubbles')
    const svgCrosshairEdit = svgCrosshairEnter.merge(svgCrosshair)
      .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
    svgCrosshairEdit.select('.x-line')
      .attr('x1', (d) => d.x(data))
      .attr('x2', (d) => d.x(data))
      .attr('y1', (d) => d.y1)
      .attr('y2', (d) => d.y2)
    svgCrosshairEdit.select('.x-text')
      .attr('x', (d) => d.x(data))
      .attr('y', (d) => d.y1 + 15)
      .text((d) => d.text(data))
    // Draw bubbles for all enabled y accessors.
    const svgBubbles = svg.select('.crosshair')
          .select('.bubbles')
          .selectAll('circle')
          .data(config.circles, (d) => d.id)
    svgBubbles.enter().append('circle')
      .attr('cx', (d) => d.x(data))
      .attr('cy', (d) => d.y(data))
      .attr('fill', (d) => d.color)
      .attr('r', 0)
      .merge(svgBubbles)
      .transition().ease(d3.easeLinear).duration(this.config.get('duration'))
      .attr('cx', (d) => d.x(data))
      .attr('cy', (d) => d.y(data))
      .attr('r', this.config.get('bubbleR'))
    svgCrosshair.exit().remove()
    if (this.config.get('tooltip')) {
      // Show tooltip
      const pos = this.$el.offset()
      const tooltipOffset = {
        left: point[0] + pos.left + 30,
        top: point[1] + pos.top + 30,
      }
      this._eventObject.trigger('showTooltip', tooltipOffset, data, this.config.get('tooltip'))
    }
  },

  hide: function () {
    const svgCrosshair = this.svgSelection().selectAll('.crosshair').data([])
    svgCrosshair.exit().remove()
    if (this.config.get('tooltip')) {
      // Hide tooltip
      this._eventObject.trigger('hideTooltip', this.config.get('tooltip'))
    }
  },

  render: function () {
    this.initSVG()
  }
})

module.exports = CrosshairView
