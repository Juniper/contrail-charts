/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'

/**
* Component to test rendering of vector contents as standalone
*/
export default class StandaloneModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.merge(super.defaults, {
      // by default will use shared container under the parent
      isSharedContainer: true,
      width: 300,
      height: 100,
    })
  }
}
