/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "jquery", "underscore", "d3",
    "contrail-charts/views/ContrailChartsView"
], function ($, _, d3, ContrailChartsView) {
    var TooltipView = ContrailChartsView.extend({
        tagName: "div",
        className: "tooltip-view",

        initialize: function (options) {
            this.config = options.config;
            this.resetParams();
            this.params.show = 0;
            this.template = contrail.getTemplate4Id( "coCharts-tooltip" );
        },

        registerTriggerEvent: function (eventObject, showEventType, hideEventType) {
            this.listenTo(eventObject, showEventType, this.show);
            this.listenTo(eventObject, hideEventType, this.hide);
        },

        generateTooltipHTML: function( tooltipConfig ) {
            var tooltipElementTemplate = contrail.getTemplate4Id( cowc.TMPL_ELEMENT_TOOLTIP ),
                tooltipElementTitleTemplate = contrail.getTemplate4Id( cowc.TMPL_ELEMENT_TOOLTIP_TITLE ),
                tooltipElementContentTemplate = contrail.getTemplate4Id( cowc.TMPL_ELEMENT_TOOLTIP_CONTENT ),
                tooltipElementObj, tooltipElementTitleObj, tooltipElementContentObj;

            tooltipConfig = $.extend( true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, tooltipConfig );

            tooltipElementObj = $( tooltipElementTemplate( tooltipConfig ) );
            tooltipElementTitleObj = $( tooltipElementTitleTemplate( tooltipConfig.title ) );
            tooltipElementContentObj = $( tooltipElementContentTemplate( tooltipConfig.content ) );

            tooltipElementObj.find( ".popover-content" ).append( tooltipElementContentObj );
            if( _.has( tooltipConfig, 'title' ) && tooltipConfig.title.name ) {
                tooltipElementObj.find( ".popover-title" ).append( tooltipElementTitleObj );
            }
            else {
                tooltipElementObj.find( ".popover-title" ).addClass( "hide" );
                tooltipElementObj.find( ".popover-remove" ).addClass( "hide" );
            }

            return tooltipElementObj;
        },

        show: function( tooltipData, tooltipConfig, offsetLeft, offsetTop ) {
            var self = this;
            self.params.show++;
            var tooltipElementObj = self.generateTooltipHTML( tooltipConfig );

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

            $( "body" ).append( this.$el );
            this.$el.html( tooltipElementObj );
            this.$el.show();

            // Tooltip dimmensions will be available after render.
            var tooltipWidth = tooltipElementObj.width();
            var tooltipHeight = tooltipElementObj.height();
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
            $(tooltipElementObj).css({
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
