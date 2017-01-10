/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./message.html')

var MessageView = ContrailChartsView.extend({
  type: 'message',
  tagName: 'div',
  className: 'coCharts-message-view',

  initialize: function (options) {
    ContrailChartsView.prototype.initialize.call(this, options)
    this.render()
    this.listenTo(this._eventObject, 'message', this.show)
    this.listenTo(this._eventObject, 'clearMessage', this.clear)
  },

  show: function (data) {
    let msgObj = _.extend({}, data)
    msgObj.componentId = msgObj.componentId || 'default'
    msgObj.action = msgObj.action || 'update' // 'new', 'once', 'update'. future: 'dismiss', 'block'
    if (msgObj.action === 'update') {
      // update message so remove any previous messages from this component
      this.clear(msgObj.componentId)
    }
    this.$el.html(_template(msgObj))

    d3.selectAll('[data-action="once"')
      .style('opacity', 1)
      .transition()
      .duration(5000)
      .style('opacity', 1e-06)
      .remove()
  },

  clear: function (componentId) {
    var messageSelector = '.message-row[data-component-id="' + componentId + '"]'
    this.$(messageSelector).fadeOut('fast', () => {
      this.$(messageSelector).remove()
    })
  },

})

module.exports = MessageView
