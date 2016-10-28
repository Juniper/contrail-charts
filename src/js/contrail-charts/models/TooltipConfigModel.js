/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery',
  'underscore',
  'contrail-charts/models/ContrailChartsConfigModel'
], function ($, _, ContrailChartsConfigModel) {
  var TooltipConfigModel = ContrailChartsConfigModel.extend({
    defaults: {}
  })

  return TooltipConfigModel
})
