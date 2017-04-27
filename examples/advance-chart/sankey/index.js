/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {ChartView} from 'coCharts'
import * as d3Scale from 'd3-scale'
import flowData from './data.json'

const chartConfig = {
  id: 'chartBox',
  components: [{
    id: 'sankey-chart-component',
    type: 'Sankey',
    config: {
      margin: {
        left: 80,
        right: 80,
        bottom: 40,
      },
      colorScheme: d3Scale.schemeCategory20,
      levels: [ { level: 0, label: 'Virtual Network' }, { level: 1, label: 'IP' }, { level: 2, label: 'Port' } ],
      parseConfig: {
        parse: function (d) {
          const links = []
          const srcHierarchy = [d.sourcevn, d.sourceip, d.sport]
          const dstHierarchy = [d.destvn, d.destip, d.dport]
          links.push({
            source: 'svn-' + srcHierarchy[0] + '-sip-' + srcHierarchy[1] + '-sport-' + srcHierarchy[2],
            target: 'svn-' + srcHierarchy[0] + '-sip-' + srcHierarchy[1],
            value: d['agg-bytes'],
            sourceNode: { label: srcHierarchy[2], level: 2 },
            targetNode: { label: srcHierarchy[1], level: 1 },
            label: srcHierarchy[2] + ' - ' + srcHierarchy[1]
          })
          links.push({
            source: 'svn-' + srcHierarchy[0] + '-sip-' + srcHierarchy[1],
            target: 'svn-' + srcHierarchy[0],
            value: d['agg-bytes'],
            sourceNode: { label: srcHierarchy[1], level: 1 },
            targetNode: { label: srcHierarchy[0], level: 0 },
            label: srcHierarchy[1] + ' - ' + srcHierarchy[0]
          })
          links.push({
            source: 'svn-' + srcHierarchy[0],
            target: 'dvn-' + dstHierarchy[0],
            value: d['agg-bytes'],
            sourceNode: { label: srcHierarchy[0], level: 0 },
            targetNode: { label: dstHierarchy[0], level: 0 },
            label: srcHierarchy[0] + ' - ' + dstHierarchy[0]
          })
          links.push({
            source: 'dvn-' + dstHierarchy[0],
            target: 'dvn-' + dstHierarchy[0] + '-dip-' + dstHierarchy[1],
            value: d['agg-bytes'],
            sourceNode: { label: dstHierarchy[0], level: 0 },
            targetNode: { label: dstHierarchy[1], level: 1 },
            label: dstHierarchy[0] + ' - ' + dstHierarchy[1]
          })
          links.push({
            source: 'dvn-' + dstHierarchy[0] + '-dip-' + dstHierarchy[1],
            target: 'dvn-' + dstHierarchy[0] + '-dip-' + dstHierarchy[1] + '-dport-' + dstHierarchy[2],
            value: d['agg-bytes'],
            sourceNode: { label: dstHierarchy[1], level: 1 },
            targetNode: { label: dstHierarchy[2], level: 2 },
            label: dstHierarchy[1] + ' - ' + dstHierarchy[2]
          })
          return links
        }
      },
      tooltip: 'tooltip-id'
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      formatter: (d) => {
        const type = ['Virtual Network', 'IP', 'Port']
        let content = { title: d.data.label, items: [] }
        content.items.push({
          label: 'Source',
          value: type[d.data.sourceNode.level] + ' ' + d.data.sourceNode.label
        }, {
          label: 'Target',
          value: type[d.data.targetNode.level] + ' ' + d.data.targetNode.label
        }, {
          label: 'Flow',
          value: d.data.value
        })
        return content
      }
    }
  }]
}

const chartView = new ChartView()

export default {
  render: () => {
    chartView.setConfig(chartConfig)
    chartView.setData(flowData.data)
    chartView.render()
  },
  remove: () => {
    chartView.remove()
  }
}
