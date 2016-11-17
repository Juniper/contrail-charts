/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var $ = require('jquery')
var _ = require('lodash')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var MessageConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    /**
    * Use a message object to generate a HTML.
    * msg.level, msg.title, msg.message
    */
    generateMessageHTML: function (msg) {
      var messageRow = $('<div></div>')
      if (msg.title) {
        messageRow.append('<span class="message-title">' + msg.title + '</span>')
      }
      if (msg.message) {
        messageRow.append('<span class="message-body">' + msg.message + '</span>')
      }
      return messageRow
    }
  }
})

module.exports = MessageConfigModel
