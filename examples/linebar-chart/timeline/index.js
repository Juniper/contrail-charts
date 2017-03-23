/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {ChartView} from 'coCharts'
import {formatter, fixture} from 'commons'

const data = fixture()
const template = _.template(
  `<div component="chart-id"></div>
  <div component="timeline-id"></div>`)

const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'chart-id',
    type: 'CompositeYChart',
    config: {
      marginInner: 10,
      marginLeft: 80,
      marginRight: 80,
      marginBottom: 40,
      height: 300,
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
            enabled: true,
            chart: 'BarChart',
            axis: 'y1',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            enabled: true,
            chart: 'LineChart',
            axis: 'y1',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            enabled: false,
            chart: 'LineChart',
            axis: 'y1',
          },
        ]
      },
      axis: {
        x: {
          formatter: formatter.extendedISOTime,
        },
        y1: {
          position: 'left',
          formatter: formatter.toInteger,
          labelMargin: 15,
        },
        y2: {
          position: 'right',
          formatter: formatter.toInteger,
          labelMargin: 15,
        }
      }
    }
  }, {
    id: 'timeline-id',
    type: 'Timeline',
    config: {
      selection: [55, 85],
      accessor: 't',
    }
  }]
}

const chart = new ChartView()

export default {
  render: () => {
    chart.setConfig(config)
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
