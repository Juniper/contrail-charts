/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsView from 'contrail-charts-view'
import Config from './StandaloneConfigModel'

export default class StandaloneView extends ContrailChartsView {
  static get Config () { return Config }

  constructor (p) {
    super(p)
    this.render()
  }

  get tagName () { return 'g' }

  render () {
    super.render()
    this.d3.append('text')
      .text('standalone component')
    this.svg.classed('standalone-is-here', true)
  }
}
