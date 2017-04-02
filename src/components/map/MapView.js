/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
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
      country: '.country',
      boundary: '.boundary',
      node: '.point',
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

  _renderLayout () {
    const world = this.config.get('map')

    const projection = this.config.get('projection')
      .scale(this.config.get('zoom'))
      .translate([this.params.width / 2, this.params.height / 2])
      .precision(0.1)

    const path = d3Geo.geoPath()
      .projection(projection)

    // TODO
    if (this.config.get('graticule')) {
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

    // TODO it may have sense to parametrize this variable to deal with other maps (not world)
    const countries = topojson.feature(world, world.objects.countries).features
    const boundaries = [topojson.mesh(world, world.objects.countries, (a, b) => a !== b)]

    this.d3.selectAll(this.selectors.country)
      .data(countries)
      .enter().insert('path', this.selectors.graticule)
      .attr('class', this.selectorClass('country'))
      .attr('d', path)

    this.d3.selectAll(this.selectors.boundary)
      .data(boundaries)
      .enter().insert('path', this.selectors.graticule)
      .attr('class', this.selectorClass('boundary'))
      .attr('d', path)
  }
  // TODO temporary method to plot data before integrating with any chart component like scatter plot
  _renderData () {
    const data = this.model.data
    this.d3.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', this.selectorClass('node'))
      .attr('cx', d => this.config.project(d)[0])
      .attr('cy', d => this.config.project(d)[1])
      .attr('r', 5)
  }

  _onMousemove (d, el) {
    const [left, top] = d3Selection.mouse(this._container)
    actionman.fire('ShowComponent', this.config.get('tooltip'), {left, top}, d)
  }

  _onMouseout (d, el) {
    actionman.fire('HideComponent', this.config.get('tooltip'))
  }
}
