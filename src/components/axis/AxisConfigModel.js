/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
*/
import _ from 'lodash'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
/**
 * Axis name is required to start with 'x' or 'y' to designate it's mathematical position
 */
export default class AxisConfigModel extends ContrailChartsConfigModel {
  static getDirection (position) {
    if (['left', 'right'].includes(position)) return 'vertical'
    if (['top', 'bottom'].includes(position)) return 'horizontal'
  }

  static getLocation (position) {
    if (['top', 'left'].includes(position)) return 'start'
    if (['bottom', 'right'].includes(position)) return 'end'
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

      margin: {
        label: 10,
      },

      // serie accessors to plot on this axis
      accessors: [],
    })
  }

  get name () {
    return this.attributes.name
  }

  get baseName () {
    return this.attributes.name.slice(0, 1)
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

  get isHorizontal () {
    return this.direction === 'horizontal'
  }

  get location () {
    return this.constructor.getLocation(this.attributes.position)
  }
  /**
   * @return {Number} relative position of the axis to the plot
   */
  get side () {
    return this.location === 'start' ? -1 : 1
  }

  get tickCoords () {
    return this.attributes.tickCoords
  }

  get labels () {
    if (this.attributes.label) return [this.attributes.label]
    return _.map(this.attributes.accessors, 'labelFormatter')
  }
}
