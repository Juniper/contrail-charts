/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Backbone from 'backbone'
import $ from 'jquery'
import * as d3Selection from 'd3-selection'
import actionman from 'core/Actionman'

d3Selection.selection.prototype.delegate = function (eventName, targetSelector, handler) {
  function delegated () {
    // TODO use jquery.closest d3 alternative here
    // as native closest is not supported in IE15
    const eventTarget = $(d3Selection.event.target).closest(targetSelector)[0]
    if (eventTarget) handler.call(eventTarget, eventTarget.__data__, eventTarget, d3Selection.event)
  }
  return this.on(eventName, delegated)
}
/**
 * Extending Backbone View
 */
export default class ContrailView extends Backbone.View {
  constructor (p) {
    super(p)
    this.actionman = actionman
    this._uniqId = this._getUniqId()
  }
  /**
   * @return {String} this class name without 'View'
   */
  get type () {
    return this.constructor.name.slice(0, -4)
  }
  /**
   * @return {String} this class name in dashed case without 'View'
   */
  get className () {
    return this.constructor.name.slice(0, -4).replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  get delegateEventSplitter () { return /^(\S+)\s*(.*)$/ }
  /**
   * Convenience method to get class name of selector
   * Just remove leading dot
   */
  selectorClass (selectorName) {
    return this.selectors[selectorName].substr(1)
  }

  // TODO move this function to Utils?
  // instanceof SVGElement works for existing element
  isTagNameSvg (tagName) {
    return _.includes(['g'], tagName)
  }

  delegateEvents (events) {
    events || (events = _.result(this, 'events'))
    if (!events) return this
    this.undelegateEvents()
    for (let key in events) {
      let method = events[key]
      if (!_.isFunction(method)) method = this[method]
      if (!method) continue
      const match = key.match(this.delegateEventSplitter)
      this.delegate(match[1], match[2], method.bind(this), events[key])
    }
    return this
  }
  /**
   * Replace jquery with d3
   * d3 doesn't support multiple listeners on the same event and element,
   * so add listener name to create event namespace
   */
  delegate (eventName, selectorName, listener, listenerName) {
    // code minification drops original listener name
    // const listenerName = listener.name.split(' ')[1]
    const uniqEventName = `${eventName}.${selectorName}.${listenerName}.delegateEvents${this.cid}`
    this.d3.delegate(uniqEventName, this.selectors[selectorName], listener)
    return this
  }
  // d3 doesn't support two levels of event namespace
  // TODO undelegate one by one
  undelegateEvents () {
    // if (this.d3) this.d3.on('.delegateEvents' + this.cid, null)
    return this
  }

  undelegate (eventName, selectorName, listener) {
    const listenerName = listener.name.split(' ')[1]
    this.d3.on(`${eventName}.${selectorName}.${listenerName}.delegateEvents${this.cid}`, null)
    return this
  }
  /**
   * svg elements are xml and require namespace to be specified
   */
  _createElement (tagName) {
    if (this.isTagNameSvg(tagName)) {
      return document.createElementNS('http://www.w3.org/2000/svg', tagName)
    } else return super._createElement(tagName)
  }
  /**
   * d3 selection shortcut for view element
   */
  _setElement (el) {
    super._setElement(el)
    this.d3 = d3Selection.select(el)
  }
  /**
   * Get unique id.
   * @private
   * @see https://stackoverflow.com/a/2117523/1191125
   * @returns {String}
   */
  _getUniqId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
}
