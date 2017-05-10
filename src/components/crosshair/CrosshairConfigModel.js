/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'
/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYView.
*/
export default class CrosshairConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, {
      // by default will use common shared container under the parent
      isSharedContainer: true,
      duration: 100,
      bubbleR: 5,
    })
  }
}
