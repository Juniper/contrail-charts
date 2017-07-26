/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Hierarchy from 'd3-hierarchy'
import * as d3Scale from 'd3-scale'
import * as d3Selection from 'd3-selection'
import * as d3Shape from 'd3-shape'
import * as d3Zoom from 'd3-zoom'
import * as d3Geo from 'd3-geo'
import * as topojson from 'topojson'
import ChartView from 'chart-view'
import Config from './TrafficMapConfigModel'
import Model from 'models/Serie'
import actionman from 'core/Actionman'
import SelectColor from '../../actions/SelectColor'
import SelectKey from '../../actions/SelectKey'
import './traffic-map.scss'

export default class TrafficMapView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {SelectColor, SelectKey} }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.node',
      link: '.link',
      active: '.active',
      graticule: '.graticule',
      feature: '.feature',
      boundary: '.boundary',
    })
  }

  get events () {
    return _.extend(super.events, {
      'click node': '_onClickNode',
      'mousemove node': '_onMousemove',
      'mouseout node': '_onMouseout',
    })
  }

  render () {
    super.render()
    this._renderMap()
    this._render()
    this._ticking = false
  }

  zoom (transform) {
    this.d3.selectAll(this.selectors.boundary)
      .style('stroke-width', 0.5 / transform.k + 'px')
    this.d3.selectAll(this.selectors.node).attr('r', 8 / transform.k)
    this.d3.selectAll(this.selectors.link)
      .style('stroke-width', 2 / transform.k + 'px')
    this.d3.attr('transform', transform)
    this._ticking = false
  }

  _render () {
    //this.d3.attr('transform', `translate(${this.config.get('margin.left')}, ${this.config.get('margin.top')})`)
    const projection = this.config.get('projection').precision(0.1)
    const data = this.model.data
    this._linksData = []
    _.each(data, source => {
      this._linksData = this._linksData.concat(_.map(source.links, sourceLink => {
        const target = _.find(data, { id: sourceLink.id })
        const linkId = `${source.id}-${sourceLink.id}`
        const link = _.extend({ source, target, linkId }, sourceLink)
        delete link.id
        return link
      }))
    })
    console.log(this._linksData)

    // Create a path for each source/target pair.
    const links = this.d3.selectAll(this.selectors.link).data(this._linksData)

    links
      .enter()
      .append('path')
      .attr('class', this.selectorClass('link'))
      .merge(links)
      .attr('d', link => {
        const source = projection([link.source.longitude, link.source.latitude])
        const target = projection([link.target.longitude, link.target.latitude])
        return this.arc(source, target, 5)
      })
      .attr('id', link => link.linkId)
      .attr('stroke-width', link => link.width)

    // Animate over links.
    this._animateOverLinks()
  }

  _animateOverLinks () {
    _.each(this._linksData, link => {
      const pathNode = this.svg.select(`#${link.linkId}`).node()
      link.len = pathNode.getTotalLength()
    })
    //window.requestAnimationFrame(this._animateOverLinks.bind(this, linksData))
  }

  arc (source, target, bend = 1) {
    if (target && source) {
      const dx = Math.abs(target[0] - source[0]) / 2
      const dy = Math.abs(target[1] - source[1]) / 2
      const mx = (target[0] + source[0]) / 2
      const my = (target[1] + source[1]) / 2
      /*
      const isVertical = dy > dx
      if (isVertical) {
        return `M${source[0]},${source[1]} C${mx},${source[1]} ${mx},${target[1]} ${target[0]},${target[1]}`
      }
      return `M${source[0]},${source[1]} C${source[0]},${my} ${target[0]},${my} ${target[0]},${target[1]}`
      */
      return `M${source[0]},${source[1]} C${source[0]},${source[1] - dy} ${target[0]},${target[1] - dy} ${target[0]},${target[1]}`
    } else {
      return 'M0,0,l0,0z'
    }
  }

  _renderMap () {
    const map = this.config.get('map.data')
    const featureName = this.config.get('map.feature')
    const featureData = topojson.feature(map, map.objects[featureName]).features
    const boundariesData = [topojson.mesh(map, map.objects[featureName], (a, b) => a !== b)]
    const path = d3Geo.geoPath()

    const projection = this.config.get('projection').precision(0.1)
    const zoomFactor = this.config.get('zoom.factor')
    if (zoomFactor) {
      projection
        .scale(zoomFactor)
        .translate([this.params.width / 2, this.params.height / 2])
      path.projection(projection)
    } else {
      const featureToFit = topojson.feature(map, map.objects[this.config.get('map.fit')])
      this._fit(path, projection, featureToFit, {width: this.width, height: this.height})
    }

    const zoom = d3Zoom.zoom()
      .scaleExtent(this.config.get('zoom.extent'))
      .on('zoom', this._onZoom.bind(this))

    this.svg.call(zoom)

    const features = this.d3.selectAll(this.selectors.feature).data(featureData)

    features
      .enter().insert('path', this.selectors.graticule)
      .attr('class', this.selectorClass('feature'))
      .merge(features)
      .attr('d', path)

    const boundaries = this.d3.selectAll(this.selectors.boundary).data(boundariesData)

    boundaries
      .enter().insert('path', this.selectors.graticule)
      .attr('class', this.selectorClass('boundary'))
      .merge(boundaries)
      .attr('d', path)
  }

  _fit (path, projection, feature, rect) {
    projection
      .scale(1)
      .translate([0, 0])

    path.projection(projection)

    const b = path.bounds(feature)
    const scale = 0.95 / Math.max((b[1][0] - b[0][0]) / rect.width, (b[1][1] - b[0][1]) / rect.height)
    const translate = [(rect.width - scale * (b[1][0] + b[0][0])) / 2, (rect.height - scale * (b[1][1] + b[0][1])) / 2]

    projection
      .scale(scale)
      .translate(translate)
  }

  // Event handlers

  _onZoom () {
    if (!this._ticking) {
      window.requestAnimationFrame(this.zoom.bind(this, d3Selection.event.transform))
      this._ticking = true
    }
  }

  _onConfigModelChange () {
    this.render()
  }

  _onMousemove (d, el) {
  }

  _onMouseout (d, el) {
  }

  _onClickNode (d, el, e) {
  }
}
