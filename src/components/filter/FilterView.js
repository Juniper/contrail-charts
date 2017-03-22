/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import './filter.scss'
import * as d3Selection from 'd3-selection'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import _template from './filter.html'

export default class FilterView extends ContrailChartsView {
  static get dataType () { return 'DataFrame' }

  constructor (p) {
    super(p)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
  }

  get events () {
    return {
      'change .filter-item-input': '_onItemClick',
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
    actionman.fire('SelectSerie', accessorName, isChecked)
  }
}
