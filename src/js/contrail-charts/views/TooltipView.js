/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery", "underscore", "d3",
    "contrail-charts/views/ContrailChartsView"
], function( $, _, d3, ContrailChartsView ) {
    var TooltipView = ContrailChartsView.extend({
        tagName: "div",
        className: "coCharts-tooltip-view",

        initialize: function (options) {
            this.config = options.config;
            this.resetParams();
            this.params.show = 0;
        },

        registerTriggerEvent: function (eventObject, showEventType, hideEventType) {
            this.listenTo( eventObject, showEventType, this.show );
            this.listenTo( eventObject, hideEventType, this.hide );
        },

        generateTooltipHTML: function( tooltipConfig ) {
            var tooltipElement = $( "<div></div>" );
            tooltipElement.addClass( "tooltip-content" );
            _.each( tooltipConfig.content.info, function( info ) {
                var tooltipItem = $( "<div></div>" );
                tooltipItem.addClass( "tooltip-item" );
                tooltipItem.append( "<span class=\"tooltip-item-label\">" + info.label + ":</span>" );
                tooltipItem.append( "<span class=\"tooltip-item-value\">" + info.value + "</span>" );
                tooltipElement.append( tooltipItem );
            });
            return tooltipElement;
        },

        show: function( tooltipData, tooltipConfig, offsetLeft, offsetTop ) {
            var self = this;
            self.params.show++;
            var tooltipElement = self.generateTooltipHTML( tooltipConfig );
            console.log( "show: ", tooltipData, tooltipConfig, offsetLeft, offsetTop );
            /*
            // TODO: This should go to view events
            $(tooltipElementObj).find(".popover-tooltip-footer").find(".btn")
                .off("click")
                .on("click", function () {
                    var actionKey = $(this).data("action"),
                        actionCallback = tooltipConfig.content.actions[actionKey].callback;
                    self.hide();
                    actionCallback(tooltipData);
                });
            $(tooltipElementObj).find(".popover-remove")
                .off("click")
                .on("click", function (e) {
                    self.hide();
                });
            */

            $( "body" ).append( this.$el );
            this.$el.html( tooltipElement );
            this.$el.show();

            // Tooltip dimmensions will be available after render.
            var tooltipWidth = tooltipElement.width();
            var tooltipHeight = tooltipElement.height();
            var windowWidth = $( document ).width();
            var tooltipPositionTop = 0;
            var tooltipPositionLeft = offsetLeft;
            if( offsetTop > tooltipHeight / 2 ) {
                tooltipPositionTop = offsetTop - tooltipHeight / 2;
            }
            if( (windowWidth - offsetLeft - 25) < tooltipWidth ) {
                tooltipPositionLeft = offsetLeft - tooltipWidth - 10;
            }
            else {
                tooltipPositionLeft += 20;
            }
            $(tooltipElement).css({
                top: tooltipPositionTop,
                left: tooltipPositionLeft
            });
        },

        hide: function( d, x, y ) {
            var self = this;
            self.params.show--;
            _.delay( function() {
                if( self.params.show <= 0 ) {
                    self.$el.hide();
                }
            }, 1000 );
        },

        render: function () {
            return self;
        }
    });

    return TooltipView;
});
