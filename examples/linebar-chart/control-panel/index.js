/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {formatter, fixture} from 'commons'

const data = fixture()

let chart
const config = {
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
        right: 20,
      },
      height: 500,
      plot: {
        x: {
          accessor: 't',
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
            accessor: 'random',
            labelFormatter: 'Random',
            color: '#d62728',
            chart: 'Line',
            axis: 'y2',
            tooltip: 'default-tooltip',
          }
        ]
      },
      axes: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          domain: [-10, undefined],
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
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

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
