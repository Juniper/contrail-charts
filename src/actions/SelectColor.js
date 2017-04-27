/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class SelectColor extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (accessorName, color) {
    const chart = this._registrar

    _.each(chart.getComponentsByType('CompositeY'), (compositeY) => {
      const plot = compositeY.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.color = color
        compositeY.config.trigger('change', compositeY.config)
      }
    })

    // Color Picker will be updated as it has CompositeY Config Model as a parent
    // as well as all CompositeY dependant components too

    _.each(chart.getComponentsByType('Navigation'), (navigation) => {
      const plot = navigation.config.get('plot')
      const accessor = _.find(plot.y, (a) => a.accessor === accessorName)
      if (accessor) {
        accessor.color = color
        navigation.config.trigger('change', navigation.config)
      }
    })

    _.each(chart.getComponentsByType('RadialDendrogram'), (radialDendrogram) => {
      const levels = radialDendrogram.config.get('levels')
      const level = _.find(levels, (level) => level.level === accessorName)
      if (level) {
        level.color = color
        radialDendrogram.config.trigger('change', radialDendrogram.config)
      }
    })
  }
}
