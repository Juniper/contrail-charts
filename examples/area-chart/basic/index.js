/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import formatter from 'formatter'
import fixture from 'fixture'
import {schemeCategory10 as colorScheme} from 'd3-scale'

const length = 10
const data = fixture({
  length: length,
  data: {
    'group.t': {linear: true, range: [1475760930000, 1475800930000]},
    'group.a': {random: true, range: [0, length * 3]},
    b: {random: true, range: [0, -length * 5]},
    c: {random: true, range: [0, -length * 7]},
  },
})
data[5].a = -10

let chart
const config = {
  id: 'chartBox',
  title: 'Area Chart',
  components: [{
    id: 'legend-id',
    type: 'LegendPanel',
    config: {
      editable: {
        color: true,
      },
    },
  }, {
    id: 'compositey-id',
    type: 'CompositeY',
    config: {
      crosshair: 'crosshair-id',
      legend: 'legend-id',
      margin: {
        label: 30,
      },
      plot: {
        x: {
          accessor: 'group.t',
          axis: 'x',
        },
        y: [
          {
            accessor: 'group.a',
            chart: 'Area',
            stack: 'positive',
            axis: 'y',
            color: colorScheme[2],
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            chart: 'Area',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[3],
            tooltip: 'default-tooltip',
          }, {
            accessor: 'c',
            chart: 'Area',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[4],
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 10,
        }
      },
    }
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
          accessor: 'group.t',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'group.a',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
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
