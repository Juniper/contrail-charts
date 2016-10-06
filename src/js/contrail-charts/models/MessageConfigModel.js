/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery",
    "underscore",
    "contrail-charts/models/ContrailChartsConfigModel"
], function( $, _, ContrailChartsConfigModel ) {
        var MessageConfigModel = ContrailChartsConfigModel.extend({
            defaults: {
                messages: [],
                
                _showOnceMessageIds: [],
                
                noDataMessage: "No Data Found",
                
                showDataStatusMessage: true,
                
                statusMessageHandler: undefined
            }
        });

        return MessageConfigModel;
    }
);
