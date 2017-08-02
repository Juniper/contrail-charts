/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import world from './world-110m.json'
import cities from './cities.json'

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'map-id',
    type: 'Map',
    config: {
      map: {
        data: world,
        feature: 'countries',
        locations: cities,
        fit: 'land'
      },
      tooltip: 'tooltip-id',
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'city',
      },
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
