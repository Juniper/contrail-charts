/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'

/**
* Component to test rendering of vector contents as standalone
*/
export default class StandaloneModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, {
      // by default will use shared container under the parent
      isSharedContainer: true,
      chartWidth: 300,
      chartHeight: 100,
    })
  }
}
