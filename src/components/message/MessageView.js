/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ChartView from 'chart-view'
import SendMessage from './actions/SendMessage'
import ClearMessage from './actions/ClearMessage'
import _template from './message.html'
import './message.scss'

export default class MessageView extends ChartView {
  static get Actions () { return {SendMessage, ClearMessage} }
  static get isMaster () { return false }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.message-row',
      message: {
        default: 'msg-default',
        info: 'msg-info',
        error: 'msg-error',
        warn: 'msg-warn'
      },
      icon: {
        default: 'fa-comment-o',
        info: 'fa-info-circle',
        error: 'fa-times-circle',
        warn: 'fa-exclamation-triangle'
      }
    })
  }

  render () {
    super.render()
    const messages = this.model.data.messages || []
    let config = _.assignIn({
      action: 'update',  // 'new', 'once', 'update'. future: 'dismiss', 'block'
    }, this.model.data)
    const template = this.config.get('template') || _template

    _.forEach(messages, msg => {
      _.assignIn(msg, {
        action: config.action,
        level: msg.level || 'default',
        iconLevel: this.selectors.icon[msg.level || 'default'],
        msgLevel: this.selectors.message[msg.level || 'default'],
      })
    })

    // only messages with 'update' action should be udpated
    const update = this.d3.selectAll(this.selectors.node).filter(d => d.action === 'update')
      .data(messages, d => d.text)
    const enter = update.enter().append('div')
      .html(d => template(d))
      .attr('class', d => `${this.selectorClass('node')} ${d.msgLevel}`)
    if (config.action === 'once') {
      enter
        .transition().duration(5000)
        .style('opacity', 1e-06)
        .remove()
    }
    update.exit().remove()
  }
}
