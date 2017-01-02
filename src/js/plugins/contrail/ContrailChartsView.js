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
    var self = this
    self.id = options.id
    self.config = options.config
    self._order = options.order
    self._container = options.container
    self._eventObject = options.eventObject || _.extend({}, Events)
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
    var self = this
    return d3.select(self.el).select('svg')
  },

  render: function (content) {
    var self = this
    const id = _.isUndefined(self.id) ? '' : self.id
    self._container.find(self.className + ' ' + id).remove()
    if (content) {
      self.$el.html(content)
    }
    self.el.dataset['order'] = self._order
    if (self._container.is(':empty')) {
      self._container.append(self.$el)
    } else {
      _.each(self._container.children(), (el) => {
        if (el.dataset['order'] > self._order) return self.$el.insertBefore(el)
      })
    }
  },
})
