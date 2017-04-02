/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {formatter} from 'commons'
import world from './world-110m.json'
import cities from './cities10.json'

const config = {
  id: 'chartBox',
  components: [{
    id: 'map-id',
    type: 'Map',
    config: {
      height: 400,
      map: world,
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: {
        accessor: 'city',
      },
      dataConfig: [{
        accessor: 'state',
        labelFormatter: 'State',
      }, {
        accessor: 'population',
        labelFormatter: 'Population',
        valueFormatter: formatter.toInteger,
      }, {
        accessor: 'rank',
        labelFormatter: 'Rank',
        valueFormatter: formatter.toInteger,
      }, {
        accessor: 'growth',
        labelFormatter: 'Growth from 2000 to 2013',
      }]
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
