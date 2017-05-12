/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import * as d3Scale from 'd3-scale'
import * as d3Ease from 'd3-ease'
import * as d3Shape from 'd3-shape'
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'

export default class SankeyConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults, {

      // Side margins.
      margin: {
        top: 5,
        bottom: 5,
        left: 50,
        right: 50
      },

      // The width of the nodes in sankey diagram.
      nodeWidth: 15,

      // The padding between nodes in sankey diagram.
      nodePadding: 2,

      // The hierarhy levels.
      levels: [],

      // The duration and ease of transitions.
      duration: 200,
      ease: d3Ease.easeCubic,
    })
  }

  set (...args) {
    super.set(ColoredChart.set(...args))
  }

  getColor (data, accessor) {
    return accessor.color || this.attributes.colorScale(accessor.level)
  }

  getAccessors () {
    return _.map(this.attributes.levels, (level) => {
      return {
        accessor: level.level,
        level: level.level,
        label: level.label,
        color: level.color,
        enabled: true
      }
    })
  }
}
