/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  'jquery',
  'underscore',
  'contrail-charts/contrail/ContrailChartsConfigModel'
], function ($, _, ContrailChartsConfigModel) {
  var ControlPanelConfigModel = ContrailChartsConfigModel.extend({
    defaults: {
    }
  })

  return ControlPanelConfigModel
})
