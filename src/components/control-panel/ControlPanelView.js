/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import ChartView from 'chart-view'
import Config from './ControlPanelConfigModel'
import actionman from 'core/Actionman'
import ToggleHalt from '../../actions/ToggleHalt'
import _template from './control-panel.html'
import _panelTemplate from './panel.html'
import _actionTemplate from './action.html'
import './control-panel.scss'

export default class ControlPanelView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return {ToggleHalt} }

  constructor (...args) {
    super(...args)
    super.render(_template())
    this._opened = false
    this.render()
  }

  get selectors () {
    return _.extend({}, super.selectors, {
      panel: '.panel',
      menuItem: '.control-panel-item',
      menuItems: '.control-panel-items',
      container: '.control-panel-expanded-container',
    })
  }

  get events () {
    return {
      'click menuItem': '_onMenuItemClick',
    }
  }

  render () {
    const configs = _.map(this.config.get('menu'), config => {
      return _.extend({}, config, this.config.menuItems[config.id])
    })
    const menuItemsDiv = this.d3.select(this.selectors.menuItems)

    const menuItems = menuItemsDiv
      .selectAll(this.selectors.menuItem)
      .data(configs, config => config.id)
      .classed('disabled', d => d.disabled)

    menuItems.enter()
      .append('div')
      .classed(this.selectorClass('menuItem'), true)
      .classed('disabled', d => d.disabled)
      .html(d => _actionTemplate(d))

    menuItems.exit()
      .remove()
  }

  setHalt (isHalted) {
    this.config.set('halted', isHalted)
  }

  addMenuItem (config) {
    this.config.set(this.config.get('menu').push(config))
  }

  removeMenuItem (id) {
    this.el.querySelector(`[data-id="${id}"]`).remove()
  }

  enableMenuItem (id) {
  }

  disableMenuItem (id) {
  }

  open (config) {
    const panel = this.el.querySelector(this.selectors.panel)
    panel.innerHTML = _panelTemplate(config)
    const container = panel.querySelector(this.selectors.container)
    panel.classList.toggle('hide')
    // TODO pass current selection if any instead of null
    actionman.fire('ToggleVisibility', config.component, !this._opened, null, {container})
    this._opened = !this._opened
  }

  // Event handlers

  _onMenuItemClick (d, el) {
    d3Selection.event.stopPropagation()
    let actionId
    if (d.component) this.open(d)
    else {
      actionId = d.action ? d.action : d.id
      actionman.fire(actionId, this.config.update, d.toggle)
    }
  }
}
