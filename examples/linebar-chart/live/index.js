/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'contrail-charts'
import {formatter, fixture} from 'commons'
import template from './template.html'
import './index.scss'

const length = 20
let counter = length
const data = fixture({
  length,
  data: {
    x: {linear: true, range: [0, length]},
    a: {linear: true, range: [0, length * 3]},
  },
})

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Halt',
      }],
      update: ['compositey-id'],
    }
  }, {
    id: 'compositey-id',
    type: 'CompositeY',
    config: {
      height: 600,
      crosshair: 'crosshair-id',
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Value',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'StackedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          scale: 'scaleLinear',
        },
        y1: {
          formatter: formatter.toInteger,
        }
      },
    },
  }, {
    id: 'crosshair-id',
    type: 'Crosshair',
    config: {
      tooltip: 'default-tooltip',
    }
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 'x',
          labelFormatter: 'X value',
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }]
}

let intervalId = -1

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
    intervalId = setInterval(() => {
      data.shift()
      data.push({x: counter, a: _.random(0, length * 3)})
      chart.setData(data)
      counter++
    }, 1000)
  },
  remove: () => {
    clearInterval(intervalId)
    chart.remove()
  },
  stopUpdating: () => {
    clearInterval(intervalId)
    intervalId = -1
  }
}
