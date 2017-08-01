/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import * as d3Scale from 'd3-scale'
import * as d3Geo from 'd3-geo'
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class TrafficMapConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults, {
      isSharedContainer: true,

      // { name: 'UDP-Flood', color: '#ff0000' }
      trafficTypes: [],
      colorScheme: d3Scale.schemeCategory10,

      projection: d3Geo.geoEquirectangular(),
      zoom: {
        // scale factor to show map at
        // 170 is the world view for mercator projection
        // If no factor is provided the whole map is fit into the container
        // factor: 170,
        step: 0.5,
        extent: [1, 8],
      },
      accessors: {
        id: 'id',
        from: 'from',
        to: 'to',
        width: 'bytes',
        longitude: 'longitude',
        latitude: 'latitude'
      },

      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },

      // The spacing between moving markers measured in pixels.
      markerSpacing: 15,

      // Speed of moving markers measured in pixels per step (step = 60 times per second).
      markerSpeed: 1,

      // Number of steps of the marker ending animation.
      markerEndAnimationSteps: 100,

      // How many times larger does the radius of the ending marker grow.
      markerEndRadiusFactor: 5
    })
  }

  project (serie) {
    const lon = this.getValue(serie, { accessor: this.get('accessors.longitude') })
    const lat = this.getValue(serie, { accessor: this.get('accessors.latitude') })
    return this.attributes.projection([lon, lat])
  }

  set (...args) {
    ColoredChart.set(...args)
    super.set(...args)
  }

  get legendData () {
    return _.map(this.attributes.levels, level => {
      return {
        key: level.level,
        label: level.label,
        color: this.getColor(level.level),
        disabled: level.level >= this.attributes.drillDownLevel,
      }
    })
  }

  get legendConfig () {
    return {colorScheme: this.attributes.colorScheme}
  }

  getColor (key) {
    const trafficType = _.find(this.attributes.trafficTypes, {name: key})
    let configuredColor = null
    if (trafficType && trafficType.color) {
      configuredColor = trafficType.color
    }
    return configuredColor || this.attributes.colorScale(key)
  }

  setColor (key, color) {
    const levels = this.get('levels')
    const level = _.find(levels, level => level.level === key)
    if (!level) return
    level.color = color
    this.trigger('change', this.config)
  }

  setKey (key, isEnabled) {
    const levels = this.attributes.levels
    const level = _.find(levels, level => level.level === key)
    if (!level) return
    let drillDownLevel = isEnabled ? level.level + 1 : level.level
    if (drillDownLevel < 1) drillDownLevel = 1
    this.set({drillDownLevel})
  }
}
