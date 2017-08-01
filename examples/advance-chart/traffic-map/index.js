/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites, models} from 'contrail-charts'
import {formatter} from 'commons'
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3TimeFormat from 'd3-time-format'
import world from './world-110m.json'
import cities from './cities.json'

const numOfCities = cities.length
const connectionsData = []
for (let i = 0; i < 250; i++) {
  const fromCityIndex = Math.floor(Math.random() * numOfCities)
  let toCityIndex = -1
  do {
    toCityIndex = Math.floor(Math.random() * numOfCities)
  } while (fromCityIndex === toCityIndex)
  const bytes = Math.round(Math.random() * 100000)
  const time = 1501158423000 + (i * 100000) + Math.floor(Math.random() * 100000)
  const connection = { id: i, from: cities[fromCityIndex].id, to: cities[toCityIndex].id, bytes, time }
  connectionsData.push(connection)
}

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
        locations: cities,
        fit: 'land'
      },
      margin: {
        left: 30,
        right: 30,
        bottom: 30,
        top: 5
      },
      colorScheme: d3Scale.schemeCategory20
    }
  }, {
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Back',
        action: 'Browse',
        attribute: 'back',
        title: 'Backwards',
        icon: 'fa fa-step-backward',
      }, {
        id: 'Start'
      }, {
        id: 'Forward',
        action: 'Browse',
        attribute: 'forward',
        title: 'Forwards',
        icon: 'fa fa-step-forward',
      }],
      update: ['navigation-id'],
    }
  }, {
    id: 'navigation-id',
    type: 'Navigation',
    config: {
      margin: {
        left: 50,
        top: 5,
        right: 5,
        bottom: 30
      },
      height: 200,
      selection: [98, 100],
      update: ['traffic-map-chart-component'],
      plot: {
        x: {
          accessor: 'time',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'bytes',
            labelFormatter: 'Bytes',
            domain: [0, undefined],
            chart: 'GroupedBar'
          }
        ]
      },
      axes: {
        x: {
          formatter: d3TimeFormat.timeFormat('%e %b %H:%M')
        },
        y: {
          formatter: formatter.byteFormatter,
          ticks: 5
        }
      }
    }
  }]
}

const model = new models.Serie(connectionsData, {
  formatter: function (data) {
    const frameDuration = 180000
    let frameTime = data[0].time
    const aggregatedData = []
    let aDataElem = { time: frameTime, bytes: 0, connections: [] }
    aggregatedData.push(aDataElem)
    _.each(data, d => {
      while (d.time - frameTime >= frameDuration) {
        frameTime += frameDuration
        aDataElem = { time: frameTime, bytes: 0, connections: [] }
        aggregatedData.push(aDataElem)
      }
      aDataElem.bytes += d.bytes
      aDataElem.connections.push(d)
    })
    return aggregatedData
  }
})

export default {
  render: () => {
    chart = new composites.CompositeView({config, model})
    chart.setData(model.data)
  },
  remove: () => {
    chart.remove()
  }
}
