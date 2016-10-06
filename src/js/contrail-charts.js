define( [
    "contrail-charts/ChartView",
    "contrail-charts/BindingHandler",
    "contrail-charts/models/CompositeYChartConfigModel",
    "contrail-charts/models/ControlPanelConfigModel",
    "contrail-charts/models/MessageConfigModel",
    "contrail-charts/models/NavigationConfigModel",
    "contrail-charts/models/TooltipConfigModel",
    "contrail-charts/models/ContrailChartsDataModel",
    "contrail-charts/models/DataProvider",
    "contrail-charts/views/CompositeYChartView",
    "contrail-charts/views/ControlPanelView",
    "contrail-charts/views/MessageView",
    "contrail-charts/views/NavigationView",
    "contrail-charts/views/TooltipView"
], function(
    ChartView,
    BindingHandler,
    CompositeYChartConfigModel,
    ControlPanelConfigModel,
    MessageConfigModel,
    NavigationConfigModel,
    TooltipConfigModel,
    ContrailChartsDataModel,
    DataProvider,
    CompositeYChartView,
    ControlPanelView,
    MessageView,
    NavigationView,
    TooltipView
) {
    return {
        ChartView: ChartView,
        BindingHandler: BindingHandler,
        CompositeYChartConfigModel: CompositeYChartConfigModel,
        ControlPanelConfigModel: ControlPanelConfigModel,
        MessageConfigModel: MessageConfigModel,
        NavigationConfigModel: NavigationConfigModel,
        TooltipConfigModel: TooltipConfigModel,
        ContrailChartsDataModel: ContrailChartsDataModel,
        DataProvider: DataProvider,
        CompositeYChartView: CompositeYChartView,
        ControlPanelView: ControlPanelView,
        MessageView: MessageView,
        NavigationView: NavigationView,
        TooltipView: TooltipView
    };
});
