/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class AxisConfigModel extends ContrailChartsConfigModel {
  static getDirection (position) {
    if (['left', 'right'].includes(position)) return 'vertical'
    if (['top', 'bottom'].includes(position)) return 'horizontal'
  }

  static getLocation (position) {
    if (['top', 'left'].includes(position)) return 'start'
    if (['bottom', 'rigth'].includes(position)) return 'end'
  }

  static defaultPosition (name) {
    if (name.startsWith('x')) return 'bottom'
    if (name.startsWith('y')) return 'left'
  }

  get defaults () {
    return Object.assign(super.defaults, {

      isSharedContainer: true,
      // Default axis ticks if not specified per axis.
      ticks: 10,

      positions: ['left', 'right', 'top', 'bottom'],

      labelMargin: 5,
    })
  }

  get name () {
    return this.attributes.name
  }

  get scale () {
    return this.attributes.scale
  }

  get formatter () {
    return this.attributes.formatter
  }

  get position () {
    return this.attributes.position || this.constructor.defaultPosition(this.attributes.name)
  }

  get direction () {
    return this.constructor.getDirection(this.attributes.position)
  }

  get location () {
    return this.constructor.getLocation(this.attributes.position)
  }

  get tickCoords () {
    return this.attributes.tickCoords
  }
}
