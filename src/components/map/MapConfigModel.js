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
      zoom: {
        // scale factor to show map at
        // 170 is the world view for mercator projection
        // If no factor is provided the whole map is fit into the container
        // factor: 170,
        step: 0.5,
        extent: [1, 8],
      },

      // grid of meridians and parallels for showing projection distortion
      graticule: false,

      accessors: {
        longitude: 'longitude',
        latitude: 'latitude',
      },
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
