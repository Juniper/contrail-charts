/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Backbone from 'backbone'

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
Backbone.Events.listeners = function listeners (event, exists) {
  const available = this._events && this._events[event]

  if (exists) return !!available
  if (!available) return []
  if (available.fn) return [available.fn]

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].callback
  }

  return ee
}
_.extend(Backbone.View.prototype, Backbone.Events)
_.extend(Backbone.Model.prototype, Backbone.Events)
export default Backbone.Events
