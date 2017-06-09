/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {_c} from 'commons'
import fixture from 'fixture'
import {schemeCategory10 as colorScheme} from 'd3-scale'

const data = fixture()

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'legend-id',
    type: 'LegendPanel',
    config: {
      editable: {
        color: true,
        chart: true,
      },
    },
  }, {
    id: 'compositeRadial-chart-id',
    type: 'CompositeRadial',
    config: {
      legend: 'legend-id',
      colorScheme: _c.radialColorScheme10,
      margin: {
        left: 30,
        right: 30,
        top: 5,
        bottom: 5,
      },
      accessors: [
        {
          chart: 'RadialBar',
          labelFormatter: 'D Values',
          angular: 'x',
          radial: 'd',
          angularAxis: 'angularAxis',
          radialAxis: 'radialAxis2',
          color: colorScheme[4],
          barPadding: 20,
        }, {
          chart: 'RadialLine',
          labelFormatter: 'A Values',
          angular: 'x',
          radial: 'a',
          angularAxis: 'angularAxis',
          radialAxis: 'radialAxis1',
          color: colorScheme[0],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'B Values',
          angular: 'x',
          radial: 'b',
          angularAxis: 'angularAxis',
          radialAxis: 'radialAxis1',
          color: colorScheme[1],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'Random Values',
          angular: 'x',
          radial: 'random',
          angularAxis: 'angularAxis',
          radialAxis: 'radialAxis2',
          color: colorScheme[2],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'C Values',
          angular: 'x',
          radial: 'c',
          angularAxis: 'angularAxis',
          radialAxis: 'radialAxis2',
          color: colorScheme[3],
        },
      ],
      axes: {
        angularAxis: {
          scale: 'scaleLinear',
          label: 'Angle',
          range: [0, 6, 4],
          removeLastAngularTick: false,
        },
        radialAxis1: {
          scale: 'scaleLinear',
          label: 'R1',
          range: ['5%', '45%'],
          ticks: 4,
        },
        radialAxis2: {
          scale: 'scaleLinear',
          label: 'R2',
          range: ['55%', '95%'],
          ticks: 4,
        },
      },
    },
  }]
}

export default {
  render: () => {
    // Create new chart with config if it's available
    // chart.setConfig is designed for chart update already rendered with data
    chart = new composites.CompositeView({config})
    // chart = new composites.CompositeRadialView({config, container})
    chart.setData(data)
  },

  remove: () => {
    chart.remove()
  }
}
