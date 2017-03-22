/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailModel from 'contrail-model'
/**
 * Base data model.
 */
export default class ContrailChartsDataModel extends ContrailModel {
  get defaults () {
    return {
      // The formatted data
      data: [],

      // to Save the current state of data fetching
      // Todo: integrate properly with ContrailListModel remoteDataHandler.
      dataStatus: undefined,

      // The current data query limits. For example the data limits set on a query that returned this data.
      // example: limit: { x: [0, 100] }
      limit: {}
    }
  }

  get data () {
    return this.get('data')
  }

  set data (data) {
    if (_.isFunction(this.get('formatter'))) {
      data = this.get('formatter')(data)
    }
    this.set({data: data})
  }

  get queryLimit () {
    return this.get('limit')
  }

  set queryLimit (limit) {
    // Simulate a query. The provided limit should be used to retreive a new data chunk.
    setTimeout(() => {
      this.set({data: this.data, limit})
    }, 1000)
  }

  // Formatter prepares the raw data. Try to avoid additional formatting on view level.
  // Navigation
  // Tooltip
  // Selection for field x and y
  // Formatter config for each field available in the data model
  // Control panel - crop and zoom, reset zoom
  // Bucketization

  // Helper functions - no need to implement in an actual DataModel.
  // However an actual DataModel would require some functions to fetch data.

  setDataAndLimit (data, limit) {
    this.data = data
    this.set({limit})
  }
}
