/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import {composites} from 'coCharts'
import {formatter, fixture} from 'commons'

const data = fixture()
const template = _.template(
  `<div component="chart-id"></div>
  <div component="timeline-id"></div>`)

let chart
const config = {
  id: 'chartBox',
  template,
  components: [{
    id: 'chart-id',
    type: 'CompositeY',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
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
            chart: 'GroupedBar',
            axis: 'y1',
          }, {
            accessor: 'b',
            labelFormatter: 'Label B',
            chart: 'Line',
            axis: 'y1',
          }, {
            accessor: 'c',
            labelFormatter: 'Label C',
            disabled: true,
            chart: 'Line',
            axis: 'y1',
          },
        ]
      },
      axes: {
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

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(data)
  },
  remove: () => {
    chart.remove()
  }
}
