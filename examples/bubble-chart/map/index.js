/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import world from './world-110m.json'
import cities from './cities.json'

const config = {
  id: 'chartBox',
  components: [{
    id: 'map-id',
    type: 'Map',
    config: {
      map: world,
      feature: 'countries',
      fit: 'land',
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

const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(config)
    chart.setData(cities)
    chart.render()
  },
  remove: () => {
    chart.remove()
  }
}
