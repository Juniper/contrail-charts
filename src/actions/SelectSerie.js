/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class SelectSerie extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, isSelected) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('CompositeYChart'), (compositeY) => {
      const plot = compositeY.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.enabled = isSelected
        compositeY.config.trigger('change', compositeY.config)
      }
    })

    // Filter will be updated as it has CompositeY Config Model as a parent
    // as well as all CompositeY dependant components too

    _.each(chart.getComponentsByType('Navigation'), (navigation) => {
      const plot = navigation.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.enabled = isSelected
        navigation.config.trigger('change', navigation.config)
      }
    })

    _.each(chart.getComponentsByType('RadialDendrogram'), (radialDendrogram) => {
      const levels = radialDendrogram.config.get('levels')
      const level = _.find(levels, (level) => level.level === accessorName)
      if (level) {
        let drillDownLevel = isSelected ? level.level + 1 : level.level
        if (drillDownLevel < 1) {
          drillDownLevel = 1
        }
        radialDendrogram.config.set('drillDownLevel', drillDownLevel)
      }
    })
  }
}
