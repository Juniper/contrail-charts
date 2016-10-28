/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery',
  'underscore',
  'contrail-charts/models/Model'
], function ($, _, Model) {
  var ContrailChartsConfigModel = Model.extend({
    initialize: function (options) {},

    /**
        * Initialize the computed parameters with the config parameters.
        */
    initializedComputedParameters: function () {
      this._computed = {}
      return _.extend(this._computed, this.toJSON())
    },

    initializedComputedParametersForChild: function (childIndex) {
      if (!_.isArray(this._computedForChild)) {
        this._computedForChild = []
      }
      this._computedForChild[childIndex] = {}
      return _.extend(this._computedForChild[childIndex], this.toJSON())
    }
  })

  return ContrailChartsConfigModel
})
