/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Backbone from 'backbone'

export default class ContrailModel extends Backbone.Model {
  constructor (...args) {
    super(...args)
    this.attributes = _.defaultsDeep(this.attributes, this.defaults)
  }

  get (attr) {
    return _.get(this.attributes, attr)
  }
}
