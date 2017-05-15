/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import {composites} from 'contrail-charts'
import {_c} from 'commons'
import dendrogamData from './data.json'

let chart
const config = {
  id: 'chartBox',
  components: [{
    id: 'legend-id',
    type: 'LegendPanel',
    config: {
      editable: {
        color: true,
      },
    }
  }, {
    id: 'dendrogram-chart-id',
    type: 'RadialDendrogram',
    config: {
      legend: 'legend-id',
      parentSeparation: 1.0,
      parentSeparationShrinkFactor: 0.05,
      parentSeparationDepthThreshold: 4,
      colorScheme: _c.radialColorScheme10,
      drawLinks: false,
      drawRibbons: true,
      arcWidth: 15,
      arcLabelLetterWidth: 5,
      showArcLabels: true,
      //labelFlow: 'along-arc',
      labelFlow: 'perpendicular',
      //arcLabelXOffset: 2,
      arcLabelXOffset: 0,
      //arcLabelYOffset: 25,
      arcLabelYOffset: 20,
      levels: [ { level: 0, label: 'Virtual Network' }, { level: 1, label: 'IP' }, { level: 2, label: 'Port' } ],
      hierarchyConfig: {
        parse: function (d) {
          const srcHierarchy = [d.sourcevn, d.sourceip, d.sport]
          const src = {
            names: srcHierarchy,
            id: srcHierarchy.join('-'),
            value: d['agg-bytes']
          }
          const dstHierarchy = [d.destvn, d.destip, d.dport]
          const dst = {
            names: dstHierarchy,
            id: dstHierarchy.join('-'),
            value: d['agg-bytes']
          }
          return [src, dst]
        }
      },
      drillDownLevel: 3,
      tooltip: 'tooltip-id',
      action: {
        'click node': data => console.warn('click node'),
        'click link': data => console.warn('click link'),
        'dblclick node': data => console.warn('dblclick node'),
        'dblclick link': data => console.warn('dblclick link'),
      },
    }
  }, {
    id: 'tooltip-id',
    type: 'Tooltip',
    config: {
      formatter: (data) => {
        const type = ['Virtual Network', 'IP', 'Port']
        let content = {title: data.name, items: []}
        content.items.push({
          label: 'Type',
          value: type[data.level - 1]
        }, {
          label: 'Flow Count',
          value: data.children.length
        })
        return content
      }
    }
  }
  ]
}

export default {
  render: () => {
    chart = new composites.CompositeView({config})
    chart.setData(dendrogamData.data)
  },
  remove: () => {
    chart.remove()
  }
}
