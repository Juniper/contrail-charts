/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import ContrailChartsView from 'contrail-charts-view'
import SendMessage from './actions/SendMessage'
import ClearMessage from './actions/ClearMessage'
import _template from './message.html'
import './message.scss'

export default class MessageView extends ContrailChartsView {
  static get Actions () { return {SendMessage, ClearMessage} }
  constructor (p) {
    super(p)
    this.params.containerList = {}
    this.render()
  }

  get selectors () {
    return _.extend(super.selectors, {
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

  show (data) {
    let msgObj = _.assignIn({
      componentId: 'default',
      action: 'update',  // 'new', 'once', 'update'. future: 'dismiss', 'block'
      messages: [],
    }, data)
    let template = this.config.get('template') || _template

    if (!this.params.containerList[msgObj.componentId]) {
      let componentElemD3 = d3Selection.select(`#${msgObj.componentId}`)

      // TODO el.closest is not supported in IE15
      if (componentElemD3.node() && componentElemD3.node().closest(this.selectors.chart)) {
        this.params.containerList[msgObj.componentId] = componentElemD3
      }
    }

    let associatedComponent = this.params.containerList[msgObj.componentId]

    if (associatedComponent) {
      if (!associatedComponent.classed(this.selectors.component.substring(1))) {
        // TODO el.closest is not supported in IE15
        associatedComponent = d3Selection.select(associatedComponent.node().closest(this.selectors.component))
      }

      this.d3.remove()
      associatedComponent.append(() => this.d3.node())
    } else {
      console.warn(`MessageView.show: invalid componentId (${msgObj.componentId})`)
    }

    if (msgObj.action === 'update') {
      // update message so remove any previous messages from this component
      this.clear(msgObj.componentId)
    }
    _.forEach(msgObj.messages, (msg) => {
      _.assignIn(msg, {
        level: msg.level || 'default',
        iconLevel: this.selectors.icon[msg.level || 'default'],
        msgLevel: this.selectors.message[msg.level || 'default'],
      })
    })

    this.$el.html(template(msgObj))

    this.d3.selectAll('[data-action="once"')
      .style('opacity', 1)
      .transition()
      .duration(5000)
      .style('opacity', 1e-06)
      .remove()
  }

  clear (componentId) {
    const messageSelector = `.message-row[data-component-id="${componentId}"]`
    this.$(messageSelector).fadeOut('fast', () => {
      this.$(messageSelector).remove()
    })
  }

  remove () {
    super.remove()
    _.each(Actions, action => actionman.unset(action, this))
  }
}
