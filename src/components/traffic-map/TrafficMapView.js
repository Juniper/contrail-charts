/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
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
import Zoom from '../../actions/Zoom'
import './traffic-map.scss'

export default class TrafficMapView extends ChartView {
  constructor (p = {}) {
    super(p)
    this._markers = []
  }

  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {SelectColor, SelectKey, Zoom} }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.node',
      link: '.link',
      marker: '.marker',
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

  /**
  * The time series slider was moved.
  */
  zoom (ranges) {
    const accessorName = _.keys(ranges)[0]
    const range = ranges[accessorName]
    const locations = this.config.get('map.locations')
    let minR = 1000000000000
    let maxR = 0
    const links = []
    _.each(this.model.data, d => {
      _.each(d.connections, connection => {
        if (range[0] <= connection[accessorName] && connection[accessorName] <= range[1]) {
          const id = `${connection.from}-${connection.to}`
          let link = _.find(this._linksData, { id })
          if (!link) {
            link = { id, bytes: connection.bytes, source: _.find(locations, { id: connection.from }), target: _.find(locations, { id: connection.to }) }
          }
          links.push(link)
        }
        if (connection.bytes < minR) {
          minR = connection.bytes
        }
        if (connection.bytes > maxR) {
          maxR = connection.bytes
        }
      })
    })
    this._linksData = links
    // Set the width of all links.
    const linkWidthScale = d3Scale.scaleLinear().domain([minR, maxR]).range([1, 10])
    _.each(this._linksData, link => link.width = linkWidthScale(link.bytes))
    this._render()
  }

  _render () {
    const data = this.model.data
    if (!this._linksData || _.isEmpty(this._linksData)) {
      return
    }
    // Create a path for each source/target pair.
    const links = this.d3.selectAll(this.selectors.link).data(this._linksData)
    links.enter().append('path')
      .attr('class', this.selectorClass('link'))
      .merge(links)
      .attr('d', link => {
        const source = this._projection([link.source.longitude, link.source.latitude])
        const target = this._projection([link.target.longitude, link.target.latitude])
        return this._arc(source, target)
      })
      .attr('id', link => link.id)
      .attr('stroke-width', link => link.width)
    links.exit().remove()
    // Animate over links.
    this._initAnimationOverLinks()
  }

  _initAnimationOverLinks () {
    const markerSpacing = this.config.get('markerSpacing')
    const markerSpeed = this.config.get('markerSpeed')
    const markerEndAnimationSteps = this.config.get('markerEndAnimationSteps')
    const markerEndRadiusFactor = this.config.get('markerEndRadiusFactor')
    this._markerFinishedRadiusScale = d3Scale.scaleLinear().domain([0, markerEndAnimationSteps]).range([1, markerEndRadiusFactor])
    this._markerFinishedOpacityScale = d3Scale.scaleLinear().domain([0, markerEndAnimationSteps]).range([1, 0])
    _.each(this._linksData, link => {
      const pathNode = this.svg.select(`#${link.id}`).node()
      link.len = pathNode.getTotalLength()
      link.markers = 0
      link.pathNode = pathNode
      link.stepsBetweenMarkerRelease = markerSpacing / markerSpeed
      if (!_.has(link, 'steps')) {
        link.steps = link.stepsBetweenMarkerRelease
      }
    })
    // Merge markers data
    _.each(this._markers, marker => {
      const foundLink = _.find(this._linksData, { id: marker.link.id })
      if (!foundLink) {
        // Link for this marker was not found in current data. Flag the marker for removing.
        marker.finished = markerEndAnimationSteps
      }
    })
    if (!this._animationStarted) {
      window.requestAnimationFrame(this._animateMarkers.bind(this))
    }
    this._animationStarted = true
  }

  _animateMarkers () {
    const markerEndAnimationSteps = this.config.get('markerEndAnimationSteps')
    const markerSpeed = this.config.get('markerSpeed')
    // Remove markers
    this._markers = _.filter(this._markers, marker => marker.finished < markerEndAnimationSteps)
    // Move existing markers
    _.each(this._markers, marker => {
      marker.offset += markerSpeed
      if (marker.offset > marker.link.len) {
        marker.offset = marker.link.len
        marker.finished++
      }
      marker.point = marker.link.pathNode.getPointAtLength(marker.offset)
    })
    // Add new markers
    _.each(this._linksData, link => {
      link.steps++
      if (link.steps > link.stepsBetweenMarkerRelease) {
        // Release a new marker.
        link.steps = 0
        link.markers++
        const point = link.pathNode.getPointAtLength(0)
        const marker = { id: `${link.id}-${link.markers}`, point, r: link.width, link, offset: 0, finished: 0 }
        this._markers.push(marker)
      }
    })
    // Render markers
    this._renderMarkers()
    window.requestAnimationFrame(this._animateMarkers.bind(this))
  }

  _renderMarkers () {
    const markersSvg = this.d3.selectAll(this.selectors.marker).data(this._markers)
    markersSvg.enter().append('circle')
      .attr('class', this.selectorClass('marker'))
      .merge(markersSvg)
      .attr('cx', marker => marker.point.x)
      .attr('cy', marker => marker.point.y)
      .attr('r', marker => marker.r * this._markerFinishedRadiusScale(marker.finished))
      .style('opacity', marker => this._markerFinishedOpacityScale(marker.finished))
      .attr('id', marker => marker.id)
    markersSvg.exit().remove()
  }

  _arc (source, target) {
    if (target && source) {
      const dx = Math.abs(target[0] - source[0]) / 2
      const dy = Math.abs(target[1] - source[1]) / 2
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
    if (!this._projection) {
      // Rendering the map for the first time.
      this._projection = this.config.get('projection').precision(0.1)
      const zoomFactor = this.config.get('zoom.factor')
      if (zoomFactor) {
        this._projection
          .scale(zoomFactor)
          .translate([this.params.width / 2, this.params.height / 2])
        path.projection(this._projection)
      } else {
        const featureToFit = topojson.feature(map, map.objects[this.config.get('map.fit')])
        this._fit(path, this._projection, featureToFit, {width: this.width, height: this.height})
      }
      const zoom = d3Zoom.zoom()
        .scaleExtent(this.config.get('zoom.extent'))
        .on('zoom', this._onZoom.bind(this))
      this.svg.call(zoom)
    } else {
      path.projection(this._projection)
    }
    const features = this.d3.selectAll(this.selectors.feature).data(featureData)
    features.enter().insert('path', this.selectors.graticule)
      .attr('class', this.selectorClass('feature'))
      .merge(features)
      .attr('d', path)
    const boundaries = this.d3.selectAll(this.selectors.boundary).data(boundariesData)
    boundaries.enter().insert('path', this.selectors.graticule)
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
    d3Zoom.zoomIdentity.k = scale
    d3Zoom.zoomIdentity.x = translate[0]
    d3Zoom.zoomIdentity.y = translate[1]
    this.config.get('zoom').extent[0] = scale
    this.config.get('zoom').extent[1] = scale * 8
    projection
      .scale(scale)
      .translate(translate)
  }

  // Event handlers

  _onZoom () {
    if (!this._ticking) {
      window.requestAnimationFrame(this._onZoomHandler.bind(this, d3Selection.event.transform))
      this._ticking = true
    }
  }

  /**
  * Called by _onZoom when no rendering is taking place.
  */
  _onZoomHandler (transform) {
    this._projection
      .scale(transform.k)
      .translate([transform.x, transform.y])
    this.render()
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
