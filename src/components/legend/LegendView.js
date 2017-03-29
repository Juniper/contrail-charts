/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsView from 'contrail-charts-view'
import _template from './legend.html'
import './legend.scss'

export default class LegendView extends ContrailChartsView {

  constructor (p) {
    super(p)
    this.listenTo(this.config, 'change', this.render)
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.getData(this.model))
    super.render(content)
  }
}
