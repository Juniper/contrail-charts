/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery', 'underscore', 'd3',
  'contrail-charts-events',
  'contrail-charts-view',
  'contrail-charts/components/message/MessageConfigModel'
], function ($, _, d3, Events, ContrailChartsView, MessageConfigModel) {
  var MessageView = ContrailChartsView.extend({
    tagName: 'div',
    className: 'coCharts-message-view',

    initialize: function (options) {
      this.config = options.config ? options.config : new MessageConfigModel()
      this.container = options.container ? options.container : $('body')
      this.resetParams()
      this.eventObject = _.extend({}, Events)

      this.listenTo(this.eventObject, 'message', this.renderMessage)
      this.listenTo(this.eventObject, 'error', this.renderErrorMessage)
    },

    registerEvents: function (eventObj, messageEvent, errorEvent) {
      this.listenTo(eventObj, messageEvent, this.renderMessage)
      this.listenTo(eventObj, errorEvent, this.renderErrorMessage)
    },

    registerModelDataStatusEvents: function (model, event) {
      if (this.params.showDataStatusMessage) {
        // Render the message for current state.
        this._prepareAndRenderDataStatusMessage(model)
        // Listen to future changes
        event = event || 'change:dataStatus'
        this.listenTo(model, event, this._prepareAndRenderDataStatusMessage(model))
      }
    },

    /**
    * If a component wants to show any massege it will trigger the "message" event on it's eventObject.
    * Here we register a handler to such an event.
    */
    registerComponentMessageEvent: function (componentEventObject) {
      this.listenTo(componentEventObject, 'message', this.handleComponentMessage)
    },

    handleComponentMessage: function (messageObj) {
      // TODO: do something with the component's message
    },

    renderMessage: function (messageObj, error) {
      var self = this
      self.container.find('.' + self.className).remove()
      self.container.append(self.$el)
      self._sortAndUpdateMessages(messageObj, error)
      var $messages = '<div></div>'
      _.each(self.params.messages, function (message) {
        $messages.append('<div>' + message + '</div>')
      })
      self.$el.html($messages)
      self.$el.css({
        top: self.container.height() / 2 + 10,
        left: self.container.width() / 2,
        position: 'absolute'
      })
      self.$el.show()
      _.defer(function () {
        self._hideShowOnceMessagesWithDelay()
      })
    },

    renderErrorMessage: function (messageObj) {
      this.renderMessage(messageObj, true)
    },

    hide: function () {
      this.$el.hide()
    },

    flushAndHide: function () {
      this.params.messages = []
      this.$el.hide()
    },

    render: function () {},

    _sortAndUpdateMessages: function (messageObj, error) {
      messageObj.error = error || false
      var found = false
      var _showOnceMessageIds = []
      // Add unique ID to message
      // messageObj.id = "message-" + cowu.generateUUID()
      var now = new Date()
      messageObj.id = 'message-' + now.getTime()

      if (this.params.messages.length > 0) {
        _.each(this.params.messages, function (msgObj) {
          if (msgObj.type === messageObj.type) {
            if (messageObj.action === 'new' || messageObj.action === 'once') {
              msgObj.action = messageObj.action
              msgObj.messages = messageObj.messages
            } else if (messageObj.action === 'update') {
              msgObj.messages.concat(messageObj.messages)
            }
            found = true
          }
          if (msgObj.action === 'once') {
            _showOnceMessageIds.push(msgObj.id)
          }
        })
      }
      if (!found) {
        if (messageObj.action === 'once') {
          _showOnceMessageIds.push(messageObj.id)
        }
        this.params.messages.push(messageObj)
      }
      this.params._showOnceMessageIds = _showOnceMessageIds
    },

    _prepareAndRenderDataStatusMessage: function (model) {
      var modelDataStatus = model.get('dataStatus')
      var action = 'new' // new, update, once

      if (modelDataStatus === 'DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY') {
        action = 'once'
      }

      this.renderMessage({
        type: 'DataModel',
        action: action,
        messages: [{
          level: 'INFO',
          title: '',
          message: this.params.statusMessageHandler(modelDataStatus)
        }]
      })
    },

    _hideShowOnceMessagesWithDelay: function () {
      _.each(this.params._showOnceMessageIds, function (id) {
        setTimeout(function () {
          $('#' + id).hide()
        }, 2000)
      // $("#" + id).delay(4000).hide()
      })
    }
  })

  return MessageView
})
