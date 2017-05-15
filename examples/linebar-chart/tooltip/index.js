/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {formatter, fixture} from 'commons'
import template from './template.html'

const data = fixture()

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'compositey-id1',
    type: 'CompositeY',
    config: {
      margin: {
        left: 60,
        right: 50,
      },
      height: 300,
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
            color: 'grey',
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
          ticks: 5,
        },
        y2: {
          position: 'right',
          formatter: formatter.toFixed1,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'default-tooltip',
    type: 'Tooltip',
    config: {
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'b',
          labelFormatter: 'Tooltip B',
          valueFormatter: formatter.toInteger,
        }, {
          accessor: 'c',
          labelFormatter: 'Tooltip C',
          valueFormatter: formatter.toInteger,
        }
      ]
    },
  }, {
    id: 'custom-tooltip',
    type: 'Tooltip',
    config: {
      template: (data) => '<div class="tooltip-content">Custom tooltip</div>',
    }
  }, {
    id: 'compositey-id2',
    type: 'CompositeY',
    config: {
      height: 200,
      plot: {
        x: {
          accessor: 't',
          labelFormatter: 'Time',
          axis: 'x',
        },
        y: [
          {
            accessor: 'a',
            labelFormatter: 'Label A',
            chart: 'GroupedBar',
            axis: 'y1',
            tooltip: 'sticky-tooltip',
          }
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          ticks: 5,
        },
      },
    },
  }, {
    id: 'sticky-tooltip',
    type: 'Tooltip',
    config: {
      sticky: true,
      dataConfig: [
        {
          accessor: 't',
          labelFormatter: 'Time',
          valueFormatter: formatter.extendedISOTime,
        }, {
          accessor: 'a',
          labelFormatter: 'Tooltip A',
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
