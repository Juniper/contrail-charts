/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import * as d3Scale from 'd3-scale'
import data from './data.json'
import world from './world-110m.json'
import cities from './cities.json'

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'traffic-map-chart-component',
    type: 'TrafficMap',
    config: {
      map: {
        data: world,
        feature: 'countries',
        fit: 'land',
      },
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
        top: 5
      },
      colorScheme: d3Scale.schemeCategory20
    }
  }]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(cities)
  },
  remove: () => {
    chart.remove()
  }
}
