/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import Action from '../core/Action'

export default class Zoom extends Action {
  constructor (p) {
    super(p)
    this._deny = false
  }

  _execute (componentIds, ...args) {
    const chart = this._registrar
    let components = []
    if (componentIds) components = _.map(componentIds, id => chart.getComponent(id))
    else {
      components.push(...chart.getComponentsByType('CompositeYChart'))
      components.push(...chart.getComponentsByType('Navigation'))
    }

    _.each(components, component => {
      if (component) component.zoom(...args)
    })
  }
}
