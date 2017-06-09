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
      angular: 'x',
      radial: 'a',
      angleAxis: 'angularAxis',
      radialAxis: 'radialAxis1',
      color: colorScheme[0],
    }, {
      chart: 'RadialLine',
      angular: 'x',
      radial: 'random',
      angleAxis: 'angularAxis',
      radialAxis: 'radialAxis2',
      color: colorScheme[1],
    },
  ],
  axes: {
    angular: {
      scale: 'scaleLinear',
      label: 'Angle',
    },
    radialAxis1: {
      scale: 'scaleLinear',
      label: 'R1',
      range: ['5%', '45%'],
    },
    radialAxis2: {
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
