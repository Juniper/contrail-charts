/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-charts/models/Events",
    "contrail-charts/views/ContrailChartsView"
], function( _, Events, ContrailChartsView ) {
    var ControlPanelView = ContrailChartsView.extend({
        tagName: "div",
        className: "coCharts-control-panel-view",

        expandedTemplates: {
            accessorData: 'SOME_TEMPLATE_ID'
        },

        initialize: function(options) {
            var self = this
            /// The config model
            self.config = options.config;

            self.listenTo( this.config, "change", self.render) ;
            self.eventObject = _.extend( {}, Events );
        },

        events: {
            "click .control-panel-item": "controlPanelItemClicked",
            "click .control-panel-filter-close": "controlPanelExpandedCloseButtonClicked",
            "change .accessor-data-checkbox": "accessorDataCheckboxChanged",
            "change .accessor-data-select": "accessorDataSelectChanged"
        },

        controlPanelItemClicked: function( e ) {
            var self = this;
            var $button = $( e.target ).closest( ".control-panel-item" );
            var buttonName = $button.attr( "data-name" );
            var button = _.findWhere( self.params.buttons, { name: buttonName } );
            if( button ) {
                self.params.activeButton = button;
                if( _.isObject( button.events ) && button.events.click ) {
                    self.eventObject.trigger( button.events.click, self.params );
                }
                if( _.has( button, 'panel' ) && button.panel.name ) {
                    var $expandedPanel = self.$el.find( ".control-panel-expanded-container" );
                    if( !$expandedPanel.hasClass( "hide" ) ) {
                        // Panel already open.
                        if( self.params.activePanel == button.panel.name ) {
                            // Same panel open so close it.
                            $expandedPanel.addClass( "hide" );
                            self.params.activePanel = null;
                        }
                        else {
                            // Different panel open so replace it.
                            self.renderPanel( button.panel.name );
                            self.params.activePanel = button.panel.name;
                        }
                    }
                    else {
                        // Panel not open so open it
                        $expandedPanel.removeClass( "hide" );
                        self.renderPanel( button.panel.name );
                        self.params.activePanel = button.panel.name;
                    }
                }
            }
        },

        controlPanelExpandedCloseButtonClicked: function( e ) {
            this.$el.find( ".control-panel-expanded-container" ).addClass( "hide" );
        },

        accessorDataCheckboxChanged: function() {
            var self = this;
            var accessorData = self.config.get( 'accessorData' );
            self.$el.find( ".accessor-data-checkbox" ).each( function() {
                var checked = $( this ).is( ":checked" );
                var key = $( this ).attr( "value" );
                accessorData[key].enable = checked;
            });
            self.config.trigger( "change:accessorData" );
        },

        accessorDataSelectChanged: function() {
            var self = this;
            var accessorData = self.config.get( 'accessorData' );
            self.$el.find( ".accessor-data-select" ).each( function() {
                var selectedChartType = $( this ).val();
                var key = $( this ).attr( "name" );
                if( selectedChartType && accessorData[key] ) {
                    accessorData[key].chartType = selectedChartType;
                }
            });
            self.config.trigger( "change:accessorData" );
        },

        renderPanel: function( panelName ) {
            var self = this;
            console.log( "Render Panel: ", self.params );
            if( self.expandedTemplates[panelName] ) {
                var expandedPanelTemplate = contrail.getTemplate4Id( self.expandedTemplates[panelName] );
                var $expandedPanelContainer = self.$el.find( ".control-panel-expanded-container" );
                $expandedPanelContainer.html( expandedPanelTemplate( self.params ) );
                if( self.params.activeButton.panel.width ) {
                    $expandedPanelContainer.css( { width: self.params.activeButton.panel.width } );
                }
            }
        },

        render: function() {
            console.log( "ControlPanelView render." );
            var self = this;
            self.resetParams();
            var $controlPanel = $( "<div class=\"control-panel-items\"></div>" );
            _.each( self.params.buttons, function( button ) {
                var $button = $( "<button data-name=\"" + button.name + "\" title=\"" + button.title + "\"></button>" );
                $button.append( "<i class=\"" + button.iconClass + "\"></i>" );
                $button.addClass( "control-panel-item" );
                $button.addClass( "control-panel-item-" + button.name );
                $controlPanel.append( $button );
            });
            self.$el.html( $controlPanel );
            self.$el.addClass( self.className );
        }
    });

    return ControlPanelView;
});
