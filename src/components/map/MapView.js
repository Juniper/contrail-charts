/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import * as d3Geo from 'd3-geo'
import * as topojson from 'topojson'
import ContrailChartsView from 'contrail-charts-view'
import actionman from 'core/Actionman'
import './map.scss'

export default class MapView extends ContrailChartsView {
  static get dataType () { return 'DataFrame' }

  constructor (...args) {
    super(...args)
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.config, 'change', this.render)
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      graticule: '.graticule',
      feature: '.feature',
      boundary: '.boundary',
      node: '.point',
      link: '.link',
    })
  }

  get events () {
    return _.extend(super.events, {
      'mousemove node': '_onMousemove',
      'mouseout node': '_onMouseout',
    })
  }

  get width () {
    return this.config.get('width') || this._container.getBoundingClientRect().width
  }

  get height () {
    return this.config.get('height') || Math.round(this.width / 2)
  }
  /**
   * Draw a world map
   */
  render () {
    this.params = {width: this.width, height: this.height}
    super.render()
    this._renderLayout()
    this._renderData()
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

  _renderLayout () {
    const map = this.config.get('map')
    const featureName = this.config.get('feature')
    const featureData = topojson.feature(map, map.objects[featureName]).features
    const boundariesData = [topojson.mesh(map, map.objects[featureName], (a, b) => a !== b)]
    const path = d3Geo.geoPath()

    const projection = this.config.get('projection')
      .precision(0.1)
    const zoomFactor = this.config.get('zoom.factor')
    if (zoomFactor) {
      projection
        .scale(zoomFactor)
        .translate([this.params.width / 2, this.params.height / 2])
      path.projection(projection)
    } else {
      const featureToFit = topojson.feature(map, map.objects[this.config.get('fit')])
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
  // TODO
  _renderGraticule () {
    if (!this.config.get('graticule')) return
    const graticule = d3Geo.geoGraticule()

    this.d3.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)

    this.d3.append('defs').append('path')
      .datum({type: 'Sphere'})
      .attr('id', 'sphere')
      .attr('d', path)

    this.d3.append('use')
      .attr('class', 'stroke')
      .attr('xlink:href', '#sphere')

    this.d3.append('use')
      .attr('class', 'fill')
      .attr('xlink:href', '#sphere')
  }
  // TODO temporary method to plot data before integrating with any chart component like scatter plot
  // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`
  _renderData () {
    const data = this.model.data
    // TODO links data extraction should take place in Data Provider
    let linksData = []
    _.each(data, source => {
      linksData = linksData.concat(_.map(source.links, sourceLink => {
        const link = _.extend({source, target: _.find(data, {id: sourceLink.id})}, sourceLink)
        delete link.id
        return link
      }))
    })

    // Create a path for each source/target pair.
    const links = this.d3.selectAll(this.selectors.link).data(linksData)

    links
      .enter()
      .append('path')
      .attr('class', this.selectorClass('link'))
      .merge(links)
      .attr('d', link => {
        const source = this.config.project(link.source)
        const target = this.config.project(link.target)
        return this.arc(source, target, 5)
      })
      .attr('stroke-width', link => link.width)

    const nodes = this.d3.selectAll(this.selectors.node).data(data)

    nodes
      .enter()
      .append('circle')
      .attr('class', this.selectorClass('node'))
      .attr('r', 8)
      .merge(nodes)
      .attr('cx', d => this.config.project(d)[0])
      .attr('cy', d => this.config.project(d)[1])
  }
  /**
   * @param {Number} bend parameter for how much bend is applied to arcs
   * If no bend is supplied, then do the plain square root
   * A bend of 5 looks nice and subtle, but this will depend on the length of arcs
   * Higher the number the less bend
   */
  arc (source, target, bend = 1) {
    if (target && source) {
      const dx = target[0] - source[0]
      const dy = target[1] - source[1]
      const dr = Math.sqrt(dx * dx + dy * dy) * bend

      // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is left or right of the target
      const isSourceLeft = (target[0] - source[0]) < 0
      if (isSourceLeft) return `M${target[0]},${target[1]}A${dr},${dr} 0 0,1 ${source[0]},${source[1]}`
      return `M${source[0]},${source[1]}A${dr},${dr} 0 0,1 ${target[0]},${target[1]}`
    } else {
      return 'M0,0,l0,0z'
    }
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

  _onMousemove (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d)
  }

  _onMouseout (d, el) {
    actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}
