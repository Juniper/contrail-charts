/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'
/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYChartView.
*/
export default class CrosshairConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, {
      // by default will use common shared container under the parent
      isSharedContainer: true,
      duration: 100,
      bubbleR: 5,
    })
  }
}
