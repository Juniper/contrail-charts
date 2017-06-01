/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'contrail-charts'
import {_c} from 'commons'
import {fixture} from 'commons'
import {schemeCategory10 as colorScheme} from 'd3-scale'

const data = fixture()

let chart
const container = document.querySelector('#chartBox')
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
          angle: 'x',
          r: 'd',
          angleAxis: 'angleAxis',
          rAxis: 'rAxis2',
          color: colorScheme[4],
          barPadding: 20,
        }, {
          chart: 'RadialLine',
          labelFormatter: 'A Values',
          angle: 'x',
          r: 'a',
          angleAxis: 'angleAxis',
          rAxis: 'rAxis1',
          color: colorScheme[0],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'B Values',
          angle: 'x',
          r: 'b',
          angleAxis: 'angleAxis',
          rAxis: 'rAxis1',
          color: colorScheme[1],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'Random Values',
          angle: 'x',
          r: 'random',
          angleAxis: 'angleAxis',
          rAxis: 'rAxis2',
          color: colorScheme[2],
        }, {
          chart: 'RadialLine',
          labelFormatter: 'C Values',
          angle: 'x',
          r: 'c',
          angleAxis: 'angleAxis',
          rAxis: 'rAxis2',
          color: colorScheme[3],
        },
      ],
      axes: {
        angleAxis: {
          scale: 'scaleLinear',
          label: 'Angle',
          range: [0, 6,4],
          removeLastAngleTick: false,
        },
        rAxis1: {
          scale: 'scaleLinear',
          label: 'R1',
          range: ['5%', '45%'],
          ticks: 4,
        },
        rAxis2: {
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
    //chart = new composites.CompositeRadialView({config, container})
    chart.setData(data)
  },

  remove: () => {
    chart.remove()
  }
}
