/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery',
  'underscore',
  'contrail-charts/models/ContrailChartsConfigModel'
], function ($, _, ContrailChartsConfigModel) {
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

  return MessageConfigModel
})
