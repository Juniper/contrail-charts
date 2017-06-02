/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import $ from 'jquery'
import _ from 'lodash'
import * as d3Color from 'd3-color'
import ChartView from 'chart-view'
import Config from './LegendPanelConfigModel'
import actionman from 'core/Actionman'
import ToggleVisibility from '../../actions/ToggleVisibility'
import _template from './legend.html'
import './legend-panel.scss'
const _states = {
  DEFAULT: 'default',
  EDIT: 'edit'
}
const icons = {
  'GroupedBar': 'icon-charttype-bar',
  'StackedBar': 'icon-charttype-stacked',
  'Line': 'icon-charttype-line',
  'Area': 'icon-charttype-area',
  'Pie': 'icon-charttype-pie'
}

export default class LegendPanelView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return {ToggleVisibility} }
  static get isMaster () { return false }

  constructor (p) {
    super(p)
    this._state = _states.DEFAULT
  }

  get selectors () {
    return _.extend({}, super.selectors, {
      key: '.legend-key',
      mode: '.edit-legend',
      select: '.select',
      colorSwitch: '.switch--color',
      chartTypeSwitch: '.switch--chart',
      axis: '.axis',
    })
  }

  get events () {
    return {
      'change key': '_toggleKey',
      'click mode': '_toggleEditMode',
      'click select': '_toggleSelector',
      'click colorSwitch': '_selectColor',
      'click chartTypeSwitch': '_selectChartType',
    }
  }

  /**
   * @private
   * @see https://github.com/d3/d3-selection/blob/master/README.md#selection_on
   * @returns {String}
   */
  _getClickEventId() {
    return 'click.' + this._uniqId
  }

  /**
   * @override
   */
  remove() {
    super.remove()
    /*
     * Remove view's outside click event handler.
     */
    d3.select('body').on(this._getClickEventId(), null);
  }

  render () {
    const template = this.config.get('template') || _template
    const data = this._prepareData()
    const content = template(data)
    super.render(content)
    /*
     * Register view's outside click event handler.
     */
    d3.select('body').on(this._getClickEventId(), this._clickOutsideEventHandler.bind(this));

    if (!this.config.attributes.filter || data.keys.length === 1) {
      this.d3.selectAll(this.selectors.key)
        .classed('disabled', true)
        .select('input')
        .property('disabled', true)
    }

    this.d3.classed('vertical', this.config.keys.placement === 'vertical')
    this.d3.selectAll(this.selectors.axis).classed('active', data.axesCount > 1)
    if (this._state === _states.EDIT) this._setEditState()
  }
  /**
   * Format data for template
   */
  _prepareData () {
    let chartTypes = []
    _.each(this.config.get('chartTypes'), (configChartTypes, axisLabel) => {
      chartTypes = chartTypes.concat(_.map(configChartTypes, chartType => {
        return {
          axisLabel,
          chartType,
          icon: icons[chartType],
        }
      }))
    })

    const data = {
      colors: this.config.get('colorScheme'),
      chartTypes,
      editable: this.config.get('editable.color') || this.config.get('editable.chart'),
    }
    data.keys = _.map(this.model.data, item => {
      return _.extend(item, {
        icon: icons[item.chartType],
        checked: this.config.get('filter') && !item.disabled,
      })
    })

    return data
  }

  _toggleKey (d, el) {
    const key = $(el).parents('.key').data('key')
    const isSelected = el.querySelector('input').checked
    actionman.fire('SelectKey', key, isSelected)
  }

  _setEditState () {
    this.$('.key').toggleClass('edit')
    this.d3.selectAll('.selector').classed('active', false)

    this.d3.select('switches-colors').classed('hide', !this.config.get('editable.color'))
    this.d3.select('switches-charts').classed('hide', !this.config.get('editable.chart'))

    _.each(this.el.querySelectorAll(this.selectors.key + ' > input'), el => {
      el.disabled = this._state !== _states.DEFAULT
    })
  }

  _toggleEditMode (d, el) {
    this._state = this._state === _states.DEFAULT ? _states.EDIT : _states.DEFAULT
    this.el.classList.toggle('edit-mode')
    this._setEditState()
  }

  _addChartTypes (keyAxis) {
    this.d3.selectAll(this.selectors.chartTypeSwitch)
      .classed('hide', true)
      .filter((d, i, n) => n[i].dataset.axis === keyAxis)
      .classed('hide', false)
  }

  _clickOutsideEventHandler () {
    this._closeSelector()
  }

  _closeSelector () {
    this.d3.select('.selector').classed('active', false)
  }

  _toggleSelector (d, el, event) {
    /*
     * Stop event propagation. This is necessary to prevent call of _clickOutsideEventHandler.
     */
    event.stopPropagation()

    this._key = $(el).parents('.key').data('key')
    const currentSelector = el.classList.contains('select--chart') ? 'chart' : 'color'

    const selector = this.d3.select('.selector')
    selector
      .classed('active', !(selector.classed('active') && selector.classed('select--' + currentSelector)))
      .classed('select--color', currentSelector === 'color')
      .classed('select--chart', currentSelector === 'chart')
    selector.selectAll('.switch').classed('selected', false)

    if (currentSelector === 'color') {
      const currentColor = d3Color.color(el.dataset.color)
      selector.selectAll(this.selectors.colorSwitch)
        .filter((d, i, n) => {
          return d3Color.color(n[i].dataset.color).toString() === currentColor.toString()
        })
        .classed('selected', true)
    }
    if (currentSelector === 'chart') {
      const currentKey = _.find(this._prepareData().keys, { 'key': this._key })
      this._addChartTypes(currentKey.axis)

      const currentChart = el.dataset.chartType
      selector.selectAll(this.selectors.chartTypeSwitch)
        .filter((d, i, n) => n[i].dataset.chartType === currentChart)
        .classed('selected', true)
    }

    const elemOffset = $(el).position()
    elemOffset.top += $(el).outerHeight() + 1
    selector
      .style('top', elemOffset.top + 'px')
      .style('left', elemOffset.left + 'px')
  }

  _selectColor (d, el, event) {
    /*
     * Stop event propagation. This is necessary to prevent call of _clickOutsideEventHandler.
     */
    event.stopPropagation()

    const color = window.getComputedStyle(el).backgroundColor
    actionman.fire('SelectColor', this._key, color)
  }

  _selectChartType (d, el) {
    const chartType = el.dataset.chartType
    actionman.fire('SelectChartType', this._key, chartType)
  }
}
