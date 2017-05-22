/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ChartView from 'chart-view'
import Config from './StandaloneConfigModel'

export default class StandaloneView extends ChartView {
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
