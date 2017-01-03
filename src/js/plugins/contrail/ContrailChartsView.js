/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const d3 = require('d3')
const Events = require('contrail-charts-events')
const ContrailView = require('contrail-view')
/**
 * View base class.
 */
module.exports = ContrailView.extend({
  defaults: {
    _type: 'ContrailChartsView',
  },

  initialize: function (options) {
    this.id = options.id
    this.config = options.config
    this._order = options.order
    this._container = options.container
    this._eventObject = options.eventObject || _.extend({}, Events)
  },
  /**
   * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
   * The view may modify the params object with calculated values.
   */
  resetParams: function () {
    this.params = this.config.initializedComputedParameters()
  },

  resetParamsForChild: function (childIndex) {
    this.params = this.config.initializedComputedParametersForChild(childIndex)
  },
  /**
  * This is how the view gets its data.
  */
  getData: function () {
    return this.model.getData()
  },
  /**
  * This is how the view gets the SVG html element selection for rendering.
  */
  svgSelection: function () {
    return d3.select(this.el).select('svg')
  },

  render: function (content) {
    if (content) this.$el.html(content)

    // append element to container first time
    const id = _.isUndefined(this.id) ? '' : this.id
    const selector = id ? '#' + id : '.' + this.className
    if (!_.isEmpty(this._container.find(selector))) return
    this.$el.addClass(this.className)
    this.el.dataset['order'] = this._order
    if (this._container.is(':empty')) {
      this._container.append(this.$el)
    } else {
      const elements = this._container.children()
      _.each(elements, (el) => {
        if (this._order < el.dataset['order']) return this.$el.insertBefore(el)
        if (_.last(elements) === el) this.$el.insertAfter(el)
      })
    }
  },
})
