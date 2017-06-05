/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {formatter} from 'commons'
import * as d3Scale from 'd3-scale'
import template from './template.html'
import './index.scss'

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
  template,
  title: 'Donut Chart',
  components: [{
    id: 'control-panel-id',
    type: 'ControlPanel',
    config: {
      menu: [{
        id: 'Refresh',
      }],
    }
  }, {
    id: 'donut-id',
    type: 'Pie',
    config: {
      legend: 'legend-id',
      tooltip: 'tooltip-id',
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
    id: 'legend-id',
    type: 'Legend',
    config: {
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
