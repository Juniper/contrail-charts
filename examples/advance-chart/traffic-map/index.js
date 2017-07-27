/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites, models} from 'contrail-charts'
import {formatter} from 'commons'
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import connectionsData from './data.json'
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
        locations: cities,
        fit: 'land'
      },
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
        top: 5
      },
      colorScheme: d3Scale.schemeCategory20
    }
  }, {
    type: 'Navigation',
    config: {
      margin: {
        left: 30,
        top: 5,
        right: 5,
        bottom: 30
      },
      height: 200,
      selection: [25, 75],
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
          formatter: formatter.extendedISOTime
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
  formatter: function(data) {
    const frameDuration = 180000
    let frameTime = data[0].time
    const aggregatedData = []
    let aDataElem = { time: frameTime, bytes: 0, connections: [] }
    aggregatedData.push(aDataElem)
    _.each(data, d => {
      while(d.time - frameTime >= frameDuration) {
        frameTime += frameDuration
        aDataElem = { time: frameTime, bytes: 0, connections: [] }
        aggregatedData.push(aDataElem)
      }
      aDataElem.bytes += d.bytes
      aDataElem.connections.push(d)
    })
    console.log('aggregatedData: ', aggregatedData)
    return aggregatedData
  }
})

export default {
  render: () => {
    chart = new composites.CompositeView({config, model})
    chart.setData(model.data)
    console.log('after render: ', chart)
  },
  remove: () => {
    chart.remove()
  }
}
