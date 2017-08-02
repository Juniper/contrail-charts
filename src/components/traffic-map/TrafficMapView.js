/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Scale from 'd3-scale'
import * as d3Selection from 'd3-selection'
import Config from './TrafficMapConfigModel'
import Model from 'models/DataFrame'
import SelectColor from '../../actions/SelectColor'
import SelectKey from '../../actions/SelectKey'
import Zoom from '../../actions/Zoom'
import MapView from '../map/MapView'
import actionman from 'core/Actionman'
import './traffic-map.scss'

export default class TrafficMapView extends MapView {
  constructor (p = {}) {
    super(p)
    // The bubbles animated on links indicating the direction of traffic.
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
      'mousemove link': '_onMousemoveLink',
      'mouseout link': '_onMouseoutLink',
    })
  }

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
    _.each(this._linksData, link => { link.width = linkWidthScale(link[accessors.width]) })
    this._renderData()
  }

  /**
  * Overrides Map._renderData.
  * Renders the links on the map.
  */
  _renderData () {
    if (!this._linksData || _.isEmpty(this._linksData)) {
      return
    }
    let linksGroupSvg = this.d3.select('.links')
    if (linksGroupSvg.empty()) {
      this.d3.append('g').attr('class', 'markers')
      this.d3.append('g').attr('class', 'links')
      linksGroupSvg = this.d3.select('.links')
    }
    // Create a path for each source/target pair.
    const linksSvg = linksGroupSvg.selectAll(this.selectors.link).data(this._linksData)
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
    // Move existing markers
    _.each(this._markers, marker => {
      marker.offset += markerSpeed
      if (marker.offset > marker.link.len) {
        marker.offset = marker.link.len
        marker.finished++
      }
      if (marker.offset < marker.link.len && marker.finished) {
        // This marker was already flaged for delete when the link changed length due to an onZoom event.
        // End the process of removing this marker.
        marker.finished = markerEndAnimationSteps
      }
      marker.point = marker.link.pathNode.getPointAtLength(marker.offset)
    })
    // Remove markers
    this._markers = _.filter(this._markers, marker => marker.finished < markerEndAnimationSteps)
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
    const markersGroupSvg = this.d3.select('.markers')
    const markersSvg = markersGroupSvg.selectAll(this.selectors.marker).data(this._markers)
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

  // Event handlers

  _onMousemoveLink (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), true, d, {left, top})
  }

  _onMouseoutLink (d, el) {
    actionman.fire('ToggleVisibility', this.config.get('tooltip'), false)
  }

  _onClickNode (d, el, e) {
  }
}
