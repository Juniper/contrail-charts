/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

const chartTypeIconMap = {
  'GroupedBar': 'fa-bar-chart',
  'StackedBar': 'fa-signal', // Todo find something better
  'Line': 'fa-line-chart',
  'Area': 'fa-area-chart',
  'Pie': 'fa-pie-chart'
}
/**
 * Legend Panel is a dependent component which retrieves its data from the parent
 */
export default class LegendPanelConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults, {
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      filter: true,
      placement: 'horizontal'
    })
  }
  /**
   * Retrieves accessors list from parent config model
   */
  get data () {
    const accessors = this._parent.accessors
    const axesCount = _.chain(accessors).map('axis').uniq().value().length

    let possibleChartTypes = []
    _.each(this._parent.get('possibleChartTypes'), (chartTypes, axisLabel) => {
      possibleChartTypes = _.concat(possibleChartTypes, _.map(chartTypes, chartType => {
        return {
          axisLabel: axisLabel,
          chartType: chartType,
          chartIcon: chartTypeIconMap[chartType]
        }
      }))
    })

    const data = {
      colors: this.attributes.colorScheme,
      possibleChartTypes: possibleChartTypes,
      editable: this.get('editable.colorSelector') || this.get('editable.chartSelector'),
      axesCount: axesCount,
    }

    data.attributes = _.map(accessors, accessor => {
      return {
        accessor: accessor.accessor,
        axis: accessor.axis,
        label: this.getLabel([], accessor),
        color: this._parent.getColor(accessor.accessor),
        chartType: accessor.chart,
        chartIcon: chartTypeIconMap[accessor.chart],
        checked: this.attributes.filter && !accessor.disabled,
        shape: accessor.shape,
      }
    })

    return data
  }
}
