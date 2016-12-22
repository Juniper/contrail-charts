/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var ContrailChartsConfigModel = require('contrail-charts-config-model')

var TooltipConfigModel = ContrailChartsConfigModel.extend({
	defaults: {
		/// Which tooltip ids to accept. If empty accept all.
		acceptFilters: []
	}
})

module.exports = TooltipConfigModel
