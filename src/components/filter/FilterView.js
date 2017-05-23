/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import ChartView from 'chart-view'
import Model from 'models/DataFrame'
import actionman from 'core/Actionman'
import _template from './filter.html'
import './filter.scss'

export default class FilterView extends ChartView {
  static get Model () { return Model }

  get selectors () {
    return _.extend({}, super.selectors, {
      item: '.filter-item-input',
    })
  }

  get events () {
    return {
      'change item': '_onItemClick',
    }
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.data)

    super.render(content)
    this.d3.classed('hide', this.config.get('embedded') && !this._visible)
  }

  _onItemClick (d, el) {
    d3Selection.event.stopPropagation()
    const accessorName = el.value
    const isChecked = el.checked
    actionman.fire('SelectKey', accessorName, isChecked)
  }
}
