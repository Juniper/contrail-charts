/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'coCharts'
import {formatter} from 'commons'
import * as d3Scale from 'd3-scale'

const data = [
  { label: 'Process 1', value: 2704659 },
  { label: 'Process 2', value: 2159981 },
  { label: 'Process 3', value: 3853788 },
  { label: 'Process 4', value: 14106543 },
  { label: 'Process 5', value: 8819342 },
  { label: 'Process 6', value: 612463 },
  { label: 'Process 7', value: 4499890 },
]

function getLabel (serie) {
  return serie.label
}
function getValue (serie) {
  return serie.value
}

let chart
const config = {
  id: 'chartBox',
  title: 'Donut Chart',
  components: [{
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-chart-id',
    type: 'Pie',
    config: {
      type: 'donut',
      radius: 150,
      colorScale: d3Scale.scaleOrdinal(d3Scale.schemeCategory20c),
      // this will not make effect as colorScale takes precendence
      colorScheme: d3Scale.schemeCategory20,
      serie: {
        getValue: getValue,
        getLabel: getLabel,
        valueFormatter: formatter.commaGroupedInteger,
      },
      tooltip: 'tooltip-id',
    },
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      title: 'Process Info',
      color: '#333',
      backgroundColor: '#fafafa',
      dataConfig: [
        {
          accessor: 'value',
          labelFormatter: getLabel,
          valueFormatter: formatter.commaGroupedInteger,
        },
      ],
    },
  }, {
    type: 'Legend',
    config: {
      sourceComponent: 'donut-chart-id',
    },
  }
  ]
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
