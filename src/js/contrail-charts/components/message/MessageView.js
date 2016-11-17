/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var Events = require('contrail-charts-events')
var ContrailChartsView = require('contrail-charts-view')

var MessageView = ContrailChartsView.extend({
  tagName: 'div',
  className: 'coCharts-message-view',

  initialize: function (options) {
    var self = this
    self.config = options.config
    self.eventObject = options.eventObject || _.extend({}, Events)
    self._registerListeners()
  },

  _registerListeners: function () {
    this.listenTo(this.eventObject, 'message', this.renderMessage)
    this.listenTo(this.eventObject, 'clearMessage', this.clearMessage)
  },

  render: function () {
    var self = this
    self.resetParams()
    self.$el.addClass(self.className)
  },

  renderMessage: function (msgObj) {
    var self = this
    var timerIndex = 0
    msgObj.componentId = msgObj.componentId || 'default'
    msgObj.action = msgObj.action || 'update' // 'new', 'once', 'update'. future: 'dismiss', 'block'
    if (msgObj.action === 'update') {
      // update message so remove any previous messages from this component
      self.clearMessage(msgObj.componentId)
    } else if (msgObj.action === 'once') {
      timerIndex = self._initializeTimer()
    }
    _.each(msgObj.messages, function (msg) {
      var msgDiv = $(self.config.get('generateMessageHTML')(msg))
      msgDiv.addClass('message-row')
      msgDiv.attr('data-component-id', msgObj.componentId)
      if (msgObj.action === 'once') {
        msgDiv.attr('data-timer-index', timerIndex)
      }
      console.log('Message: ', msgDiv)
      self.$el.append(msgDiv)
    })
  },

  clearMessage: function (componentId) {
    var self = this
    var messageSelector = '.message-row[data-component-id="' + componentId + '"]'
    self._clearMessageForSelector(messageSelector)
  },

  _initializeTimer: function () {
    var self = this
    if (!self.params.timerIndex) {
      self.params.timerIndex = 0
    }
    self.params.timerIndex++
    _.delay(_.bind(self._clearMessageForTimerIndex, self), 5000, self.params.timerIndex)
    return self.params.timerIndex
  },

  _clearMessageForTimerIndex: function (timerIndex) {
    var self = this
    var messageSelector = '.message-row[data-timer-index="' + timerIndex + '"]'
    self._clearMessageForSelector(messageSelector)
  },

  _clearMessageForSelector: function (messageSelector) {
    var self = this
    self.$el.find(messageSelector).fadeOut('fast', function () { self.$el.find(messageSelector).remove() })
  }
})

module.exports = MessageView
