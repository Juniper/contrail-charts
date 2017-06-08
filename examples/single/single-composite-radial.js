/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {fixture} from 'commons'
import {schemeCategory10 as colorScheme} from 'd3-scale'

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
      rAxis: 'rAxis1',
      color: colorScheme[0],
    }, {
      chart: 'RadialLine',
      angle: 'x',
      r: 'random',
      angleAxis: 'angleAxis',
      rAxis: 'rAxis2',
      color: colorScheme[1],
    },
  ],
  axes: {
    angleAxis: {
      scale: 'scaleLinear',
      label: 'Angle',
    },
    rAxis1: {
      scale: 'scaleLinear',
      label: 'R1',
      range: ['5%', '45%'],
    },
    rAxis2: {
      scale: 'scaleLinear',
      label: 'R2',
      range: ['55%', '95%'],
    },
  },
}

export default {
  render: () => {
    // Create new chart with config if it's available
    // chart.setConfig is designed for chart update already rendered with data
    chart = new composites.CompositeRadialView({config, container})
    chart.setData(data)
  },

  remove: () => {
    chart.remove()
  }
}
