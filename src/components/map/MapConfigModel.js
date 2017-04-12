/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import * as d3Geo from 'd3-geo'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class MapConfigModel extends ContrailChartsConfigModel {
  get defaults () {
    return Object.assign(super.defaults, ColoredChart.defaults, {
      isSharedContainer: true,

      projection: d3Geo.geoMercator(),
      // scale factor to show map at
      // 170 - is the world view for mercator projection
      zoom: 170,

      // grid of meridians and parallels for showing projection distortion
      graticule: false,

      accessors: {
        longitude: 'longitude',
        latitude: 'latitude',
      }
    })
  }

  get zoom () {
    return this.attributes.zoom
  }

  project (serie) {
    const lon = this.getValue(serie, { accessor: this.get('accessors.longitude') })
    const lat = this.getValue(serie, { accessor: this.get('accessors.latitude') })
    return this.attributes.projection([lon, lat])
  }
}
