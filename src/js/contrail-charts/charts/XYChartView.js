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
    /**
    * Chart with a common X axis and many possible child components rendering data on the Y axis (for example: line, bar, stackedBar).
    * Many different Y axis may be configured.
    */
    var XYChartView = View.extend({

        initialize: function() {
            var self = this;
            self.hasExternalBindingHandler = false;
            self.chartDataModel = new ContrailChartsDataModel();
            self.dataProvider = new DataProvider( { parentDataModel: self.chartDataModel } );
        },

        /**
        * Provide data for this chart as a simple array of objects.
        * Additional ContrailChartsDataModel configuration may be provided.
        * Setting data to a rendered chart will trigger a DataModel change event that will cause the chart to be re-rendered.
        */
        setData: function( data, dataConfig ) {
            var self = this;
            dataConfig = dataConfig || {};
            self.chartDataModel.set( dataConfig, { silent: true } );
            // Set data to data model.
            if( _.isArray( data ) ) {
                self.chartDataModel.setData( data );
            }
        },

        /**
        * Provides a global BindingHandler to this chart.
        * If no BindingHandler is provided it will be instantiated by this chart if needed based on its local configuration.
        */
        setBindingHandler: function( bindingHandler ) {
            var self = this;
            self.hasExternalBindingHandler = (bindingHandler != null);
            self.bindingHandler = bindingHandler;
        },

        /**
        * Sets the configuration for this chart as a simple object.
        * This will cause a lazy component init.
        */
        setConfig: function( config ) {
            var self = this;
            self.chartConfig = config;
            if( !self.chartConfig.chartId ) {
                self.chartConfig.chartId = 'XYChartView';
            }
            self.componentInit();
        },

        /**
        * Instantiate the required views if they do not exist yet, set their configurations otherwise.
        * Setting configuration to a rendered chart will trigger a ConfigModel change event that will cause the chart to be re-rendered.
        */
        componentInit: function() {
            var self = this;
            // TODO: all this initialization may be automated based on config.
            if( self.isEnabledComponent( "bindingHandler" ) ) {
                if( !self.bindingHandler ) {
                    self.bindingHandler = new BindingHandler( self.chartConfig.bindingHandler );
                }
                else {
                    self.bindingHandler.addBindings( self.chartConfig.bindingHandler.bindings, self.chartConfig.chartId );
                }
            }
            if( self.isEnabledComponent( "message" ) ) {
                // Common Message View. will be used for rendering info messages and errors.
                if( !self.messageView ) {
                    self.messageView = new MessageView({
                        config: new MessageConfigModel( self.chartConfig.message ),
                        container: $( self.chartConfig.message.el )
                    });
                }
                else {
                    self.messageView.config.set( self.chartConfig.message );
                }
                if( self.isEnabledComponent( "bindingHandler" ) || self.hasExternalBindingHandler ) {
                    self.bindingHandler.addComponent( self.chartConfig.chartId, "message", self.messageView );
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
                if( self.isEnabledComponent( "bindingHandler" ) || self.hasExternalBindingHandler ) {
                    self.bindingHandler.addComponent( self.chartConfig.chartId, "tooltip", self.tooltipView );
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
                if( self.isEnabledComponent( "bindingHandler" ) || self.hasExternalBindingHandler ) {
                    self.bindingHandler.addComponent( self.chartConfig.chartId, "navigation", self.navigationView );
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
                if( self.isEnabledComponent( "bindingHandler" ) || self.hasExternalBindingHandler ) {
                    self.bindingHandler.addComponent( self.chartConfig.chartId, "mainChart", self.compositeYChartView );
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
                if( self.isEnabledComponent( "bindingHandler" ) || self.hasExternalBindingHandler ) {
                    self.bindingHandler.addComponent( self.chartConfig.chartId, "controlPanel", self.controlPanelView );
                }
            }
            if( self.isEnabledComponent( "bindingHandler" ) && !self.hasExternalBindingHandler ) {
                // Only start the binding handler if it is not an external one.
                // Otherwise assume it will be started by the parent chart.
                self.bindingHandler.start();
            }
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

    return XYChartView;
});
