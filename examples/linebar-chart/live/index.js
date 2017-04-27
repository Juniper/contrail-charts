/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {formatter, fixture} from 'commons'

let counter = 0
const length = 21

const chartConfig = {
  id: 'chartBox',
  components: [{
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Freeze',
      }],
    }
  }, {
    id: 'compositey-id',
    type: 'CompositeYChart',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
      height: 600,
      crosshair: 'crosshair-id',
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'X Value',
          axis: 'x'
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
          position: 'left',
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
const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(chartConfig)
    clearInterval(intervalId)
    intervalId = setInterval(() => {
      const dataConfig = {
        length: length,
        data: {
          x: {linear: true, range: [counter, counter + length]},
          a: {linear: true, range: [counter, counter + length * 3]},
        },
      }
      const data = fixture(dataConfig)
      chart.setData(data)
      counter++
    }, 1000)
  },
  remove: () => {
    chart.remove()
  },
  stopUpdating: () => {
    clearInterval(intervalId)
    intervalId = -1
  }
}
