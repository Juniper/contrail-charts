/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ChartView from 'chart-view'
import Config from './LegendConfigModel'
import ToggleVisibility from '../../actions/ToggleVisibility'
import _template from './legend.html'
import './legend.scss'

export default class LegendView extends ChartView {
  static get Config () { return Config }
  static get Actions () { return {ToggleVisibility} }
  static get isMaster () { return false }

  render () {
    const template = this.config.get('template') || _template
    const content = template(this.model.data)
    super.render(content)
  }
}
