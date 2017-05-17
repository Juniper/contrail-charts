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
    left: 30,
    right: 30,
    top: 5,
    bottom: 5,
  },
  accessors: [
    {
      chart: 'RadialLine',
      angle: 'x',
      r: 'a',
      angleAxis: 'angleAxis',
      rAxis: 'rAxis',
    }, {
      chart: 'RadialLine',
      angle: 'x',
      r: 'random',
      angleAxis: 'angleAxis',
      rAxis: 'rAxis',
    },
  ],
  axes: {
    angleAxis: {
      scale: 'scaleLinear',
      label: 'Angle',
    },
    rAxis: {
      scale: 'scaleLinear',
      label: 'R',
    },
  },
}

export default {
  render: () => {
    // Create new chart with config if it's available
    // chart.setConfig is designed for chart update already rendered with data
    chart = new composites.CompositeRadialView({config, container})
    chart.setData(data)
    console.log('data: ', data)
    console.log('chart._composite: ', chart._composite)
    console.log('chart._composite domain: ', chart._composite._components[0].config.get('angle.scale').domain())
    console.log('chart._composite range: ', chart._composite._components[0].config.get('angle.scale').range())
  },

  remove: () => {
    chart.remove()
  }
}
