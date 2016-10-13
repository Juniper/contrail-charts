define( [
    "jquery", "underscore",
    "contrail-charts/models/CompositeYChartConfigModel",
    "contrail-charts/models/ControlPanelConfigModel",
    "contrail-charts/models/MessageConfigModel",
    "contrail-charts/models/NavigationConfigModel",
    "contrail-charts/models/TooltipConfigModel",
    "contrail-charts/models/ContrailChartsDataModel",
    "contrail-charts/models/DataProvider",
    "contrail-charts/views/View",
    "contrail-charts/views/CompositeYChartView",
    "contrail-charts/views/ControlPanelView",
    "contrail-charts/views/MessageView",
    "contrail-charts/views/NavigationView",
    "contrail-charts/views/TooltipView",
    "contrail-charts/BindingHandler"
], function(
    $, _,
    CompositeYChartConfigModel,
    ControlPanelConfigModel,
    MessageConfigModel,
    NavigationConfigModel,
    TooltipConfigModel,
    ContrailChartsDataModel,
    DataProvider,
    View,
    CompositeYChartView,
    ControlPanelView,
    MessageView,
    NavigationView,
    TooltipView,
    BindingHandler
) {
    var ChartView = View.extend({
        initialize: function() {
            var self = this;
            self.componentMap = {
                message: { view: MessageView, config: MessageConfigModel },
                tooltip: { view: TooltipView, config: TooltipConfigModel },
                navigation: { view: NavigationView, config: NavigationConfigModel },
                mainChart: { view: CompositeYChartView, config: CompositeYChartConfigModel },
                controlPanel: { view: ControlPanelView, config: ControlPanelConfigModel }
            };
        },

        setData: function( data, dataConfig ) {
            var self = this;
            dataConfig = dataConfig || {};
            // Instantiate data model if it did not exist.
            if( !self.chartDataModel ) {
                self.chartDataModel = new ContrailChartsDataModel( {
                    dataParser: dataConfig.dataParser
                });
            }
            // Set data to data model.
            if( _.isArray( data ) ) {
                self.chartDataModel.setData( data );
            }
            // Instantiate data provider if it did not exist.
            if( !self.dataProvider ) {
                self.dataProvider = new DataProvider({
                    parentDataModel: self.chartDataModel
                });
            }
        },

        setConfig: function( config ) {
            var self = this;
            self.chartConfig = config;
            self.lazyComponentInit();
        },

        isEnabledComponent: function( configName ) {
            var self = this;
            var enabled = false;
            if( _.isObject( self.chartConfig[configName] ) ) {
                if( self.chartConfig[configName].enable !== false ) {
                    enabled = true;
                }
            }
            return enabled;
        },

        /**
        * Instantiate the required views if they do not exist yet, set their configurations otherwise.
        */
        lazyComponentInit: function() {
            var self = this;
            var selector = $( "body" );
            // TODO: all this initialization may be automated based on config.
            if( self.isEnabledComponent( "bindingHandler" ) ) {
                if( !self.bindingHandler ) {
                    self.bindingHandler = new BindingHandler( self.chartConfig.bindingHandler );
                }
                else {
                    self.bindingHandler.set( self.chartConfig.bindingHandler );
                }
            }
            if( self.isEnabledComponent( "message" ) ) {
                // Common Message View. will be used for rendering info messages and errors.
                // TODO: id should be config based
                if( !self.messageView ) {
                    self.messageView = new MessageView({
                        config: new MessageComponentConfigModel( self.chartConfig.message ),
                        container: $( self.chartConfig.message.el )
                    });
                }
                else {
                    self.messageView.config.set( self.chartConfig.message );
                }
                if( self.isEnabledComponent( "bindingHandler" ) ) {
                    self.bindingHandler.addComponent( "message", self.messageView );
                }
                // One way to bind to message events of already created model.
                self.messageView.registerModelDataStatusEvents( self.chartDataModel );
            }
            if( self.isEnabledComponent( "tooltip" ) ) {
                if( !self.tooltipView ) {
                    self.tooltipView = new TooltipView({
                        config: new TooltipConfigModel( self.chartConfig.tooltip )
                    });
                }
                else {
                    self.tooltipView.config.set( self.chartConfig.tooltip );
                }
                if( self.isEnabledComponent( "bindingHandler" ) ) {
                    self.bindingHandler.addComponent( "tooltip", self.tooltipView );
                }
            }
            var dataProvider = self.dataProvider;
            if( self.isEnabledComponent( "navigation" ) ) {
                // TODO: id should be config based
                if( !self.navigationView ) {
                    self.navigationView = new NavigationView({
                        model: dataProvider,
                        config: new NavigationConfigModel( self.chartConfig.navigation ),
                        el: $( self.chartConfig.navigation.el )
                    });
                }
                else {
                    self.navigationView.config.set( self.chartConfig.navigation );
                }
                if( self.isEnabledComponent( "bindingHandler" ) ) {
                    self.bindingHandler.addComponent( "navigation", self.navigationView );
                }
                // The remaining components dataModel will be the one fetched from the navigationView.
                dataProvider = self.navigationView.getFocusDataProvider();
                if( self.isEnabledComponent( "message" ) ) {
                    self.messageView.registerComponentMessageEvent( self.navigationView.eventObject );
                }
            }
            if( self.isEnabledComponent( "mainChart" ) ) {
                if( !self.compositeYChartView ) {
                    self.compositeYChartView = new CompositeYChartView({
                        model: dataProvider,
                        config: new CompositeYChartConfigModel( self.chartConfig.mainChart ),
                        el: $( self.chartConfig.mainChart.el )
                    });
                }
                else {
                    self.compositeYChartView.config.set( self.chartConfig.mainChart );
                }
                console.log( "MainChart: ", self.compositeYChartView );
                if( self.isEnabledComponent( "bindingHandler" ) ) {
                    self.bindingHandler.addComponent( "mainChart", self.compositeYChartView );
                }
                if( self.isEnabledComponent( "message" ) ) {
                    self.messageView.registerComponentMessageEvent( self.compositeYChartView.eventObject );
                }
                if( self.isEnabledComponent( "tooltip" ) ) {
                    self.tooltipView.registerTriggerEvent( self.compositeYChartView.eventObject, "showTooltip", "hideTooltip" );
                }
            }
            if( self.isEnabledComponent( "controlPanel" ) ) {
                if( !self.controlPanelView ) {
                    self.controlPanelView = new ControlPanelView( {
                        config: new ControlPanelConfigModel( self.chartConfig.controlPanel ),
                        el: $( self.chartConfig.controlPanel.el )
                    });
                }
                else {
                    self.controlPanelView.config.set( self.chartConfig.controlPanel );
                }
                if( self.isEnabledComponent( "bindingHandler" ) ) {
                    self.bindingHandler.addComponent( "controlPanel", self.controlPanelView );
                }
            }
            if( self.isEnabledComponent( "bindingHandler" ) ) {
                self.bindingHandler.start();
            }
        },

        render: function() {
            var self = this;
            if( self.isEnabledComponent( "message" ) ) {
                self.messageView.render();
            }
            if( self.isEnabledComponent( "tooltip" ) ) {
                self.tooltipView.render();
            }
            if( self.isEnabledComponent( "navigation" ) ) {
                self.navigationView.render();
            }
            if( self.isEnabledComponent( "mainChart" ) ) {
                self.compositeYChartView.render();
            }
            if( self.isEnabledComponent( "controlPanel" ) ) {
                self.controlPanelView.render();
            }
        }
    });

    return ChartView;
});
