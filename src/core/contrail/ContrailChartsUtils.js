/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

const ContrailUtils = {
  getConfigModelName (viewName) {
    return viewName.replace('View', 'ConfigModel')
  }
}
module.exports = ContrailUtils
