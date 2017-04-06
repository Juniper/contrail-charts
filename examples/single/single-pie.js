import _ from 'lodash'
import {components} from 'coCharts'
import {formatter, fixture} from 'commons'
import * as d3Scale from 'd3-scale'

let length = 20
const data = fixture({
  length,
  data: {
    'group.value': {random: true, range: [0, length]},
    'group.label': {linear: true, range: [1, length - 1]},
  },
})

let chart
let intervalId = -1
const container = document.querySelector('#chartBox')

const config = {
  type: 'donut',
  radius: 150,
  serie: {
    getValue: serie => serie.group.value,
    getLabel: serie => serie.group.label,
    valueFormatter: formatter.commaGroupedInteger,
  },
}

export default {
  render: () => {
    clearInterval(intervalId)
    chart = new components.PieView({config, container})
    chart.setData(data)

    intervalId = setInterval(() => {
      length = _.random(3, 20)
      config.type = _.sample(['pie', 'donut'])
      config.colorScheme = d3Scale.schemeCategory20b
      chart.setConfig(config)
      chart.setData(data.slice(0, length))
    }, 2000)
  },
  remove: () => {
    chart.remove()
  },
  stopUpdating: () => {
    clearInterval(intervalId)
    intervalId = -1
  }
}
