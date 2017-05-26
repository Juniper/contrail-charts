/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import './sankey.scss'
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Sankey from 'd3-sankey'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'

export default class SankeyView extends ContrailChartsView {
  static get dataType () { return 'Serie' }

  get tagName () { return 'g' }
  get className () { return 'sankey' }
  get events () {
    return {
      'mouseover .link': '_onMouseoverLink',
      'mouseout .link': '_onMouseoutLink'
    }
  }

  constructor (p = {}) {
    super(p)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
    /**
     * Let's bind super _onResize to this. Also .bind returns new function ref.
     * we need to store this for successful removal from window event
     */
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  render () {
    this.resetParams()
    this._calculateDimensions()
    this._prepareLayout()
    super.render()
    this._render()
    this._ticking = false
  }

  remove () {
    super.remove()
    window.removeEventListener('resize', this._onResize)
  }

  _calculateDimensions () {
    this.params.width = this.config.get('width') || this._container.getBoundingClientRect().width
    this.params.height = this.config.get('height') || 3 * this.params.width / 5
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
      .nodeWidth(this.params.nodeWidth)
      .nodePadding(this.params.nodePadding)
      .size([this.params.width - this.params.marginLeft - this.params.marginRight, this.params.height - this.params.marginTop - this.params.marginBottom])
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
  }

  _render () {
    this.d3.attr('transform', `translate(${this.params.marginLeft}, ${this.params.marginTop})`)
    // Links
    const path = this._sankey.link()
    const svgLinks = this.d3.selectAll('.link').data(this._links)
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
    const svgNodes = this.d3.selectAll('.node').data(this._nodes)
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
      .filter((d) => d.x > this.params.width / 2)
      .attr('x', 5 + this._sankey.nodeWidth())
      .attr('text-anchor', 'start')
    const svgNodesEdit = svgNodesEnter.merge(svgNodes).transition().ease(this.config.get('ease')).duration(this.params.duration)
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
      .filter((d) => d.x > this.params.width / 2)
      .attr('x', 5 + this._sankey.nodeWidth())
      .attr('text-anchor', 'start')
  }

  // Event handlers

  _onMouseoverLink (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d)
  }

  _onMouseoutLink (d, el) {
    actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}
