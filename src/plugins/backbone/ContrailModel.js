/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Backbone from 'backbone'

export default class ContrailModel extends Backbone.Model {
  get (attr) {
    return _.get(this.attributes, attr)
  }
}
