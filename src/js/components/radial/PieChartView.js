/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
// Todo why config model is not used?
// const ContrailChartsDataModel = require('contrail-charts-data-model')
// const PieChartConfigModel = require('./PieChartConfigModel')
/**
* Group of charts rendered in polar coordinates system
* TODO merge with ChartView as long as XYChart too
*/
class Self extends ContrailChartsView.extend({
  type: 'radialChart',
  className: 'coCharts-pie-chart',
}) {
  constructor (options = {}) {
    super(options)
    this._highlightRadius = 10
    this.listenTo(this.model, 'change', this._onDataModelChange)
    this.listenTo(this.config, 'change', this._onConfigModelChange)
  }

  changeModel (model) {
    this.stopListening(this.model)
    this.model = model
    this.listenTo(this.model, 'change', this._onDataModelChange)
  }

  render () {
    const width = this.config.get('chartWidth')
    const height = this.config.get('chartHeight')
    const serieConfig = this.config.get('serie')
    const radius = this.config.get('radius')
    const data = this.model.get('data')

    let svg = this.svgSelection()
    if (svg.empty() || !svg.classed(this.className)) {
      svg = this.initSVG()
    }

    const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(this.config.getInnerRadius())

    const pie = d3.pie()
      .sort(null)
      .value((d) => serieConfig.getValue(d))(data)

    svg
      .attr('width', width)
      .attr('height', height)
    const group = svg.append('g')
      .classed('pie-chart', true)
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    group.selectAll('arc')
      .data(pie)
      .enter().append('path')
      .classed('arc', true)
      .attr('d', arc)
      .style('fill', (d) => this.config.getColor(serieConfig.getLabel(d.data)))
      .on('mouseover', this._onHover.bind(this))
      .on('mouseout', this._onMouseout.bind(this))
  }

  // Event handlers

  _onDataModelChange () {
    this.render()
  }

  _onConfigModelChange () {
    this.render()
  }

  _onHover (sector) {
    // TODO consider case with missing width config in order to occupy all available space
    const serieConfig = this.config.get('serie')
    const width = this.config.get('chartWidth')
    const height = this.config.get('chartHeight')
    const outerRadius = this.config.get('radius')
    const innerRadius = this.config.getInnerRadius()
    // const valueAccessor = this.config.get('serie').getValue
    const chartOffset = this.svgSelection().node().getBoundingClientRect()
    const tooltipOffset = {
      left: chartOffset.left + width / 2 - innerRadius * 0.707,
      top: chartOffset.top + height / 2 - innerRadius * 0.707,
      width: innerRadius * 0.707 * 2,
      height: innerRadius * 0.707 * 2,
    }
    const arc = d3.arc(sector)
      .innerRadius(outerRadius)
      .outerRadius(outerRadius + this._highlightRadius)
      .startAngle(sector.startAngle)
      .endAngle(sector.endAngle)
    this.svgSelection().select('.pie-chart')
      .append('path')
      .classed('arc', true)
      .classed('highlight', true)
      .attr('d', arc)
      .style('fill', this.config.getColor(serieConfig.getLabel(sector.data)))
    this._eventObject.trigger('showTooltip', tooltipOffset, sector.data)
  }

  _onMouseout (e) {
    this.svgSelection().select('.highlight').remove()
  }
}

module.exports = Self
