/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
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
    c: {random: true, range: [0, -length * 5]},
  },
})
data[5].a = -10

const chartConfig = {
  id: 'chartBox',
  title: 'Area Chart',
  components: [{
    type: 'LegendPanel',
    config: {
      sourceComponent: 'compositey-id',
      editable: {
        colorSelector: true,
      },
      placement: 'horizontal',
      filter: true,
    },
  }, {
    id: 'compositey-id',
    type: 'CompositeYChart',
    config: {
      crosshair: 'crosshair-id',
      plot: {
        x: {
          accessor: 'group.t',
          axis: 'x',
        },
        y: [
          {
            enabled: true,
            accessor: 'group.a',
            chart: 'AreaChart',
            stack: 'positive',
            axis: 'y',
            color: colorScheme[2],
            tooltip: 'default-tooltip',
          }, {
            enabled: true,
            accessor: 'b',
            chart: 'AreaChart',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[3],
            tooltip: 'default-tooltip',
          }, {
            enabled: true,
            accessor: 'c',
            chart: 'AreaChart',
            stack: 'negative',
            axis: 'y',
            color: colorScheme[4],
            tooltip: 'default-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y: {
          ticks: 10,
        }
      }
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

const chartView = new ChartView()

export default {
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(data)
  },
  remove: () => {
    chartView.remove()
  }
}
