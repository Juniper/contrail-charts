/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './legend-panel.scss'
import $ from 'jquery'
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import * as d3Color from 'd3-color'
import actionman from 'core/Actionman'
import _template from './legend.html'
const _states = {
  DEFAULT: 'default',
  EDIT: 'edit'
}

export default class LegendPanelView extends ContrailChartsView {
  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
    this._state = _states.DEFAULT
  }

  get events () {
    return {
      'change .legend-attribute': '_toggleAttribute',
      'click .edit-legend': '_toggleEditMode',
      'click .select': '_toggleSelector',
      'click .swatch--color': '_selectColor',
      'click .swatch--chart': '_selectChartType',
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)
    super.render(content)

    if (!this.config.attributes.filter || this.config.data.attributes.length === 1) {
      this.d3.selectAll('.legend-attribute')
        .classed('disabled', true)
        .select('input')
        .property('disabled', true)
    }

    this.d3.classed('vertical', this.config.attributes.placement === 'vertical')
    this.d3.selectAll('.axis').classed('active', this.config.data.axesCount > 1)
    if (this._state === _states.EDIT) this._setEditState()
  }

  _toggleAttribute (d, el) {
    const accessorName = $(el).parents('.attribute').data('accessor')
    const isChecked = el.querySelector('input').checked
    actionman.fire('SelectSerie', accessorName, isChecked)
  }

  _setEditState () {
    this.$('.attribute').toggleClass('edit')
    this.d3.selectAll('.selector').classed('active', false)

    this.d3.selectAll('.select--color').classed('hide', !this.config.attributes.editable.colorSelector)
    this.d3.selectAll('.select--chart').classed('hide', !this.config.attributes.editable.chartSelector)

    _.each(this.el.querySelectorAll('.legend-attribute > input'), el => {
      el.disabled = this._state !== _states.DEFAULT
    })
  }

  _toggleEditMode (d, el) {
    this._state = this._state === _states.DEFAULT ? _states.EDIT : _states.DEFAULT
    this.el.classList.toggle('edit-mode')
    this._setEditState()
  }

  _addChartTypes (attributeAxis) {
    this.d3.selectAll('.swatch--chart')
    .classed('show', false)
    .filter(function (d, i, n) {
      return n[i].dataset.axis === attributeAxis
    }).classed('show', true)
  }

  _toggleSelector (d, el) {
    this._accessor = $(el).parents('.attribute').data('accessor')

    const selectorElement = this.d3.select('.selector')
    selectorElement
      .classed('select--color', false)
      .classed('select--chart', false)
    selectorElement.selectAll('.swatch').classed('selected', false)

    if (this.el.querySelector('.selector').classList.contains('active')) {
      selectorElement.classed('active', false)
    } else if (el.classList.contains('select--color')) {
      selectorElement.classed('active', true).classed('select--color', true)
      const currentColor = d3Color.color(el.dataset.color)
      selectorElement.selectAll('.swatch--color')
        .filter(function (d, i, n) {
          return d3Color.color(n[i].dataset.color).toString() === currentColor.toString()
        })
        .classed('selected', true)
    } else if (el.classList.contains('select--chart')) {
      const currentAttribute = _.find(this.config.data.attributes, { 'accessor': this._accessor })
      this._addChartTypes(currentAttribute.axis)
      selectorElement
        .classed('active', true)
        .classed('select--chart', true)
      const currentChart = el.dataset.chartType
      selectorElement.selectAll('.swatch--chart')
        .filter(function (d, i, n) {
          return n[i].dataset.chartType === currentChart
        })
        .classed('selected', true)
    }

    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight() + 1
    selectorElement
      .style('top', elemOffset.top + 'px')
      .style('left', elemOffset.left + 'px')
  }

  _selectColor (d, el) {
    const color = window.getComputedStyle(el).backgroundColor
    actionman.fire('SelectColor', this._accessor, color)
  }

  _selectChartType (d, el) {
    const chartType = el.dataset.chartType
    actionman.fire('SelectChartType', this._accessor, chartType)
  }
}
