/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import {formatter} from 'commons'

// Complex example
const complexData = []
for (let i = 0; i < 100; i++) {
  const a = Math.random() * 100
  complexData.push({
    x: 1475760930000 + 1000000 * i,
    a: a,
    b: a + Math.random() * 10,
    c: Math.random() * 100,
    d: i + (Math.random() - 0.5) * 10,
    e: (Math.random() - 0.5) * 10,
  })
}

const chartConfig = {
  id: 'chartBox',
  components: [{
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }, {
        id: 'Filter',
        component: 'filter-id',
      }, {
        id: 'ColorPicker',
        component: 'color-picker-id',
      }],
    }
  }, {
    id: 'compositey-id',
    type: 'CompositeY',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
      height: 500,
      plot: {
        x: {
          accessor: 'x',
          labelFormatter: 'Time',
          axis: 'x'
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'StackedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'StackedBar',
            axis: 'y1',
            tooltip: 'custom-tooltip',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            disabled: true,
            chart: 'StackedBar',
            axis: 'y1',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'd',
            labelFormatter: 'Megabytes D',
            color: '#d62728',
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }, {
            accessor: 'e',
            labelFormatter: 'Megabytes E',
            color: '#9467bd',
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          labelMargin: 15,
          domain: [-10, undefined]
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
          labelMargin: 15
        }
      }
    },
  }, {
    id: 'color-picker-id',
    type: 'ColorPicker',
    config: {
      sourceComponent: 'compositey-id',
      embedded: true,
    }
  }, {
    id: 'filter-id',
    type: 'Filter',
    config: {
      sourceComponent: 'compositey-id',
      embedded: true,
    },
  }]
}

const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(chartConfig)
    chart.setData(complexData)
  },
  remove: () => {
    chart.remove()
  }
}
