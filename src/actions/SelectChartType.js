/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class SelectChartType extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }
  /**
   * To update chart type of an accessor under the component.
   * If the updated chart type is one of BarChart type, then we will change all charts (any of bar chart type)
   * under the axis to same updated chart type. This is to avoid showing bar and stacked bar under one axis.
   * @param component
   * @param accessorName
   * @param chartType
   * @private
   */
  _updateChartType (component, accessorName, chartType) {
    const barCharts = ['BarChart', 'StackedBarChart']
    let triggerChange = false
    const plot = component.config.get('plot')
    const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
    if (_.includes(barCharts, chartType)) {
      // Find all bar charts under the same axis that of accessor.
      const barAccessors = _.filter(plot.y, (a) => {
        return _.includes(barCharts, a.chart) && a.axis === accessor.axis
      })
      // If the chart to updated is currently not a Bar (eg: Line or area), add it to the bar accessors to be updated.
      if (!_.includes(barCharts, accessor.chart)) barAccessors.push(accessor)
      if (barAccessors) {
        _.each(barAccessors, accessor => {
          accessor.chart = chartType
        })
        triggerChange = true
      }
    } else {
      if (accessor) {
        accessor.chart = chartType
        triggerChange = true
      }
    }
    if (triggerChange) component.config.trigger('change', component.config)
  }

  _execute (accessorName, chartType) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('CompositeYChart'), (compositeY) => {
      this._updateChartType(compositeY, accessorName, chartType)
    })

    _.each(chart.getComponentsByType('Navigation'), (navigation) => {
      this._updateChartType(navigation, accessorName, chartType)
    })
  }
}
