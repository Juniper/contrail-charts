/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import DataModel from './Data'

export default class SerieModel extends DataModel {
  get accessors () {
    return _.keys(this._data)
  }
}
