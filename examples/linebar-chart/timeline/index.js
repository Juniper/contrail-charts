/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'contrail-charts'
import {formatter, fixture} from 'commons'

const data = fixture()
const template = _.template(
  `<div component="chart-id"></div>
  <div component="timeline-id"></div>`)

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'chart-id',
    type: 'CompositeY',
    config: {
      height: 300,
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            chart: 'Line',
            axis: 'y1',
            color: '#1f77b4',
          }, {
            accessor: 'b',
            chart: 'GroupedBar',
            axis: 'y1',
            color: '#aec7e8',
          },
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
        },
      }
    }
  }, {
    id: 'timeline-id',
    type: 'Timeline',
    config: {
      selection: [55, 85],
      accessor: 'x',
      update: ['chart-id'],
    }
  }]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
