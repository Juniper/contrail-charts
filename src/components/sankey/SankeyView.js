/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Sankey from 'd3-sankey'
import ChartView from 'chart-view'
import Config from './SankeyConfigModel'
import Model from 'models/Serie'
import actionman from 'core/Actionman'
import './sankey.scss'

export default class SankeyView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }

  get tagName () { return 'g' }

  get events () {
    return {
      'mouseover link': '_onMouseoverLink',
      'mouseout link': '_onMouseoutLink',
      'click node': '_onClickNode'
    }
  }

  get selectors () {
    return _.extend(super.selectors, {
      link: '.link',
      node: '.node'
    })
  }

  render () {
    super.render()
    this._prepareLayout()
    this._render()
    this._ticking = false
  }

  remove () {
    super.remove()
    window.removeEventListener('resize', this._onResize)
  }

  _prepareLayout () {
    const data = this.model.data
    const nodeNameMap = {}
    const parseConfig = this.config.get('parseConfig')
    this._nodes = []
    this._links = []
    _.each(data, (d) => {
      // Parsing a data element should return an array of links: { source: 'sourceNodeName', target: 'targetNodeName', value: value }
      const parsedLinks = parseConfig.parse(d)
      _.each(parsedLinks, (link, i) => {
        if (!link.value || link.value <= 0) {
          return
        }
        if (!nodeNameMap[link.source]) {
          const node = { name: link.source, label: link.sourceNode.label, level: link.sourceNode.level, index: this._nodes.length }
          nodeNameMap[link.source] = node
          this._nodes.push(node)
        }
        if (!nodeNameMap[link.target]) {
          const node = { name: link.target, label: link.targetNode.label, level: link.targetNode.level, index: this._nodes.length }
          nodeNameMap[link.target] = node
          this._nodes.push(node)
        }
        const sourceIndex = nodeNameMap[link.source].index
        const targetIndex = nodeNameMap[link.target].index
        let foundLink = null
        // Check if this link already exists.
        _.each(this._links, (uniqueLink) => {
          if ((uniqueLink.source === sourceIndex && uniqueLink.target === targetIndex) ||
            (uniqueLink.source === targetIndex && uniqueLink.target === sourceIndex)) {
            foundLink = uniqueLink
          }
        })
        if (foundLink) {
          foundLink.value += link.value
        } else {
          this._links.push({ source: sourceIndex, target: targetIndex, value: link.value, data: link })
        }
      })
    })
    this._sankey = d3Sankey.sankey()
      .nodeWidth(this.config.get('nodeWidth'))
      .nodePadding(this.config.get('nodePadding'))
      .size([this.innerWidth, this.innerHeight])
    this._sankey
      .nodes(this._nodes)
      .links(this._links)
      .layout(32)
    // Fix node dimmensions if they are too small.
    _.each(this._nodes, (node) => {
      if (node.dy < 1) {
        node.dy = 1
      }
    })
    // Fix link coordinates if they are too small.
    _.each(this._links, (link) => {
      if (link.dy < 1) {
        link.dy = 0
      }
      if (link.ty < 1) {
        link.ty = 0
      }
      if (link.sy < 1) {
        link.sy = 0
      }
    })
  }

  _render () {
    this.d3.attr('transform', `translate(${this.config.get('margin.left')}, ${this.config.get('margin.top')})`)
    // Links
    const path = this._sankey.link()
    const svgLinks = this.d3.selectAll(this.selectors.link).data(this._links)
    svgLinks.enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function (d) {
        return Math.max(1, d.dy)
      })
      .merge(svgLinks)
      .attr('d', path)
      .style('stroke-width', function (d) {
        return Math.max(1, d.dy)
      })
    svgLinks.exit().remove()
    // Nodes
    const svgNodes = this.d3.selectAll(this.selectors.node).data(this._nodes)
    const svgNodesEnter = svgNodes.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
    svgNodesEnter.append('rect')
      .attr('width', this._sankey.nodeWidth())
      .attr('height', (d) => d.dy)
    svgNodesEnter.append('text')
      .attr('x', -5)
      .attr('y', (d) => d.dy / 2)
      .attr('text-anchor', 'end')
      .text((d) => d.dy > 10 ? d.label : '')
      .filter((d) => d.x > this.width / 2)
      .attr('x', 5 + this._sankey.nodeWidth())
      .attr('text-anchor', 'start')
    const svgNodesEdit = svgNodesEnter.merge(svgNodes).transition().ease(this.config.get('ease')).duration(this.config.get('duration'))
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
    svgNodesEdit.select('rect')
      .style('fill', (d) => this.config.getColor([], this.config.get('levels')[d.level]))
      .attr('width', this._sankey.nodeWidth())
      .attr('height', (d) => d.dy)
    svgNodesEdit.select('text')
      .attr('x', -5)
      .attr('y', (d) => d.dy / 2)
      .attr('text-anchor', 'end')
      .text((d) => d.dy > 10 ? d.label : '')
      .filter((d) => d.x > this.width / 2)
      .attr('x', 5 + this._sankey.nodeWidth())
      .attr('text-anchor', 'start')
  }

  // Event handlers

  _onMouseoverLink (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    const tooltipConfig = {left, top, container: this._container}
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), true, d, tooltipConfig)
  }

  _onMouseoutLink (d, el) {
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), false)
  }
}
