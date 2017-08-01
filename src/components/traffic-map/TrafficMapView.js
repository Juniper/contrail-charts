/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Selection from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import * as d3Geo from 'd3-geo'
import * as topojson from 'topojson'
import ChartView from 'chart-view'
import Config from './TrafficMapConfigModel'
import Model from 'models/DataFrame'
import SelectColor from '../../actions/SelectColor'
import SelectKey from '../../actions/SelectKey'
import Zoom from '../../actions/Zoom'
import MapView from '../map/MapView'
import './traffic-map.scss'

export default class TrafficMapView extends MapView {
  constructor (p = {}) {
    super(p)
    // The bubbles animated on links indicating the direction of traffic.
    this._markers = []
    // Flag indicating if zoom was applied. Zoom is applied on first render.
    this._zoomApplied = false
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

  /*
  render () {
    super.render()
    this._renderMap()
    this._renderData()
    this._ticking = false
  }
  */

  /**
  * The time series slider was moved.
  */
  zoom (ranges) {
    const accessorName = _.keys(ranges)[0]
    const range = ranges[accessorName]
    const locations = this.config.get('map.locations')
    const accessors = this.config.get('accessors')
    let minR = 1000000000000
    let maxR = 0
    const links = []
    _.each(this.model.data, d => {
      _.each(d.connections, connection => {
        if (range[0] <= connection[accessorName] && connection[accessorName] <= range[1]) {
          const id = connection[accessors.id]
          let link = _.find(this._linksData, { id })
          if (!link) {
            link = {
              id,
              bytes: connection[accessors.width],
              source: _.find(locations, { id: connection[accessors.from] }),
              target: _.find(locations, { id: connection[accessors.to] }),
              trafficType: connection.trafficType
            }
          }
          links.push(link)
        }
        if (connection[accessors.width] < minR) {
          minR = connection[accessors.width]
        }
        if (connection[accessors.width] > maxR) {
          maxR = connection[accessors.width]
        }
      })
    })
    this._linksData = links
    // Set the width of all links.
    const linkWidthScale = d3Scale.scaleLinear().domain([minR, maxR]).range([1, 10])
    _.each(this._linksData, link => { link.width = linkWidthScale(link.bytes) })
    this._renderData()
  }

  _renderData () {
    const accessors = this.config.get('accessors')
    if (!this._linksData || _.isEmpty(this._linksData)) {
      return
    }
    // Create a path for each source/target pair.
    const linksSvg = this.d3.selectAll(this.selectors.link).data(this._linksData)
    linksSvg.enter().append('path')
      .attr('class', this.selectorClass('link'))
      .merge(linksSvg)
      .attr('d', link => {
        const source = this.config.project(link.source)
        const target = this.config.project(link.target)
        return this._arc(source, target)
      })
      .attr('id', link => `c${link.id}`)
      .style('stroke-width', link => link.width)
      .style('stroke', link => this.config.getColor(link.trafficType))
    linksSvg.exit().remove()
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
      const pathNode = this.d3.select(`#c${link.id}`).node()
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
    if (!this._animationStarted) {
      return
    }
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
        const marker = { id: `${link.id}-${link.markers}`, point, r: link.width / 2, link, offset: 0, finished: 0 }
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
      .style('fill', marker => this.config.getColor(marker.link.trafficType))
      .attr('id', marker => marker.id)
    markersSvg.exit().remove()
  }

  remove () {
    super.remove()
    this._animationStarted = false
  }

  /*
  _arc (source, target) {
    if (target && source) {
      const dx = Math.abs(target[0] - source[0]) / 3
      const dsx = (target[0] - source[0]) / 3
      const dtx = (source[0] - target[0]) / 3
      const dsy = (target[1] - source[1]) / 3
      const dty = (source[1] - target[1]) / 3
      return `M${source[0]},${source[1]} C${source[0] + dsx},${source[1] + dsy - dx} ${target[0] + dtx},${target[1] + dty - dx} ${target[0]},${target[1]}`
    } else {
      return 'M0,0,l0,0z'
    }
  }

  _renderMap () {
    this.d3.attr('transform', `translate(${this.config.get('margin.left')}, ${this.config.get('margin.top')})`)
    const map = this.config.get('map.data')
    const featureName = this.config.get('map.feature')
    const featureData = topojson.feature(map, map.objects[featureName]).features
    const boundariesData = [topojson.mesh(map, map.objects[featureName], (a, b) => a !== b)]
    const path = d3Geo.geoPath()
    const projection = this.config.get('projection')
    if (!this._zoomApplied) {
      // Rendering the map for the first time.
      const zoomFactor = this.config.get('zoom.factor')
      if (zoomFactor) {
        projection
          .scale(zoomFactor)
          .translate([this.width / 2, this.height / 2])
      } else {
        const featureToFit = topojson.feature(map, map.objects[this.config.get('map.fit')])
        this._fit(path, projection, featureToFit, {width: this.innerWidth, height: this.innerHeight})
      }
      const zoom = d3Zoom.zoom()
        .scaleExtent(this.config.get('zoom.extent'))
        .on('zoom', this._onZoom.bind(this))
      this.svg.call(zoom)
      this._zoomApplied = true
    }
    path.projection(projection)
    let mapSvg = this.d3.select('.map')
    if (mapSvg.empty()) {
      this.d3.append('g').attr('class', 'map')
      mapSvg = this.d3.select('.map')
    }
    const features = mapSvg.selectAll(this.selectors.feature).data(featureData)
    features.enter().append('path')
      .attr('class', this.selectorClass('feature'))
      .merge(features)
      .attr('d', path)
    features.exit().remove()
    const boundaries = mapSvg.selectAll(this.selectors.boundary).data(boundariesData)
    boundaries.enter().append('path')
      .attr('class', this.selectorClass('boundary'))
      .merge(boundaries)
      .attr('d', path)
    boundaries.exit().remove()
  }

  _fit (path, projection, feature, rect) {
    const zoomExtent = this.config.get('zoom.extent')
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
    this.config.get('zoom').extent[0] = scale * zoomExtent[0]
    this.config.get('zoom').extent[1] = scale * zoomExtent[1]
    projection
      .scale(scale)
      .translate(translate)
  }
  */

  // Event handlers

  /*
  _onZoom () {
    if (!this._ticking) {
      window.requestAnimationFrame(this._onZoomHandler.bind(this, d3Selection.event.transform))
      this._ticking = true
    }
  }
  */

  /**
  * Called by _onZoom when no rendering is taking place.
  */
  /*
  _onZoomHandler (transform) {
    this.config.get('projection')
      .scale(transform.k)
      .translate([transform.x, transform.y])
    this.render()
  }
  */

  _onMousemove (d, el) {
  }

  _onMouseout (d, el) {
  }

  _onClickNode (d, el, e) {
  }
}
