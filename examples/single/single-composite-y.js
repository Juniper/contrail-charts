/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'contrail-charts'
import {fixture} from 'commons'

const data = fixture()

let chart
const container = document.querySelector('#chartBox')
const config = {
  margin: {
    left: 60,
    right: 30,
  },
  height: 300,
  plot: {
    x: {
      accessor: 'x',
      labelFormatter: 'Value',
      axis: 'x',
    },
    y: [
      {
        accessor: 'a',
        labelFormatter: 'Label Group.A',
        chart: 'Line',
        axis: 'y1',
      }, {
        accessor: 'b',
        labelFormatter: 'Label B',
        chart: 'Line',
        axis: 'y1',
      }, {
        accessor: 'c',
        disabled: true,
        labelFormatter: 'Label C',
        chart: 'StackedBar',
        axis: 'y2',
      }
    ]
  },
  axes: {
    x: {
      scale: 'scaleLinear',
      label: 'X',
    },
    y1: {
      ticks: 6,
    },
    y2: {
      position: 'right',
      // this value is ignored because second axis is synced with previous
      ticks: 5,
    },
  },
}

export default {
  render: () => {
    // Create new chart with config if it's available
    // chart.setConfig is designed for chart update already rendered with data
    chart = new composites.CompositeYView({config, container})
    chart.setData(data)

    setTimeout(() => {
      config.plot.y[2].disabled = false
      chart.setConfig(config)
    }, 2000)
    setTimeout(() => {
      config.plot.y[0].disabled = true
      config.plot.y[1].disabled = true
      chart.setConfig(config)
    }, 4000)
    setTimeout(() => {
      const length = _.random(3, 20)
      chart.setData(data.slice(0, length))
    }, 6000)
  },
  remove: () => {
    chart.remove()
  }
}
