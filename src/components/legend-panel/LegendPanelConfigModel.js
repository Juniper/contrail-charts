/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

const chartTypeIconMap = {
  'BarChart': 'fa-bar-chart',
  'StackedBarChart': 'fa-signal', // Todo find something better
  'LineChart': 'fa-line-chart',
  'AreaChart': 'fa-area-chart',
  'PieChart': 'fa-pie-chart'
}

export default class LegendPanelConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, ColoredChart.defaults, {
      editable: {
        colorSelector: true,
        chartSelector: true
      },
      filter: true,
      placement: 'horizontal'
    })
  }

  get data () {
    const accessors = this._parent.getAccessors()
    const axesCount = _.chain(accessors).map('axis').uniq().value().length

    let possibleChartTypes = []
    _.each(this._parent.attributes.possibleChartTypes, function (chartTypes, axisLabel) {
      possibleChartTypes = _.concat(possibleChartTypes, _.map(chartTypes, function (chartType) {
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
      editable: this.attributes.editable.colorSelector || this.attributes.editable.chartSelector,
      axesCount: axesCount
    }

    data.attributes = _.map(accessors, accessor => {
      return {
        accessor: accessor.accessor,
        axis: accessor.axis,
        label: this.getLabel([], accessor),
        color: this._parent.getColor([], accessor),
        chartType: accessor.chart,
        chartIcon: chartTypeIconMap[accessor.chart],
        checked: this.attributes.filter ? accessor.enabled : true,
        shape: accessor.shape,
      }
    })

    return data
  }
}
