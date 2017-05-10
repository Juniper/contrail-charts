/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ChartView from 'chart-view'
import Config from './LegendConfigModel'
import _template from './legend.html'
import './legend.scss'

export default class LegendView extends ChartView {
  static get Config () { return Config }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
  }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.config.getData(this.model))
    super.render(content)
  }
}
