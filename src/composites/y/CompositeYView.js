/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import ChartView from 'chart-view'
import Config from './CompositeYConfigModel'
import Model from 'models/DataFrame'
import CompositeChart from 'helpers/CompositeChart'
import SelectColor from '../../actions/SelectColor'
import SelectAccessor from '../../actions/SelectAccessor'
import Zoom from '../../actions/Zoom'
import SelectChartType from './actions/SelectChartType'
import './y.scss'
/**
 * Creates composed chart with X and Y scales and compatible components like: Line, Area, StackedBar, etc
 */
export default class CompositeYView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return {SelectColor, SelectAccessor, SelectChartType, Zoom} }

  constructor (...args) {
    super(...args)
    this._composite = new CompositeChart()
    this.listenTo(this.model, 'change', this.render)
  }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.child',
      axis: '.axis',
      plot: 'clipPath',
    })
  }

  render () {
    super.render()
    this._updateComponents()
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
    this._renderAxes()

    let plot = this.d3.select(this.selectors.plot)
    if (plot.empty()) {
      plot = this.d3.append(this.selectors.plot)
        .attr('id', `${this.id}-${this.selectors.plot}`)
        .append('rect')
    }
    plot.attr('width', this.innerWidth).attr('height', this.innerHeight)

    // force composite scale for children components
    const components = this._composite.getByType(_(this.config.yAccessors).map('chart').uniq().value())
    _.each(components, component => {
      const componentAxis = this.config.getAxisName(component.config.get('y'))
      // TODO even without silent this will not trigger config 'change' because of nested attribute
      component.config.set('y.scale', this.config.get(`axes.${componentAxis}.scale`), {silent: true})
      component.render()
    })

    this._ticking = false
  }
  /**
   * Works only with incremental values at x scale, as range is set as min / max values for x scale
   * There is no option to set zoomed range by exact position at x scale (start / end)
   */
  zoom (ranges) {
    const accessorsByAxis = _.groupBy(this.config.yAccessors, 'axis')
    accessorsByAxis.x = [{accessor: this.config.get('plot.x.accessor')}]
    _.each(accessorsByAxis, (accessors, axisName) => {
      if (_.isEmpty(_.filter(accessors, a => ranges[a.accessor]))) return
      const range = d3Array.extent(_(accessors).map(accessor => ranges[accessor.accessor]).flatten().value())
      if (range[0] !== range[1] || _.isNil(range[0])) this.config.set(`axes.${axisName}.domain`, range)
    })
  }
  /**
   * Render axes and calculate inner margins for charts
   */
  _renderAxes () {
    const elements = this.svg.selectAll(this.selectors.axis)
      .data(this.config.activeAxes, d => d.name)

    elements.enter().each(axis => {
      const component = this._composite.add({
        type: 'Axis',
        config: this.config.getAxisConfig(axis.name),
        container: this._container,
      })
      component.el.__data__ = axis
    })

    elements.each(axis => {
      const component = this._composite.get(axis.id)
      // if only a scale is changed Backbone doesn't trigger "change" event and no render will happen
      component.config.set(this.config.getAxisConfig(axis.name))
    })

    elements.exit().each(axis => {
      this._composite.remove(axis.id)
    })
  }
  /**
   * Child components are initialized on the first call
   * Individual component scales are calculated and stored in this.config
   * No rendering here
   */
  _updateComponents (p) {
    const config = {
      // all sub charts should not react on model change as some preparation for them is done here
      frozen: true,
      // TODO add axes space to the chart margins
      margin: this.config.margin,
      width: this.width,
      height: this.height,
      x: {
        accessor: this.config.get('plot.x.accessor'),
        domain: this.config.get('axes.x.domain'),
        scale: this.config.get('axes.x.scale'),
      }
    }
    const children = this.svg.selectAll(this.selectors.node)
      .data(this.config.children, d => d.key)

    children.enter().merge(children).each(child => {
      const type = this.config.getComponentType(child.accessors)
      config.id = `${this.id}-${child.key}`
      if (this.config.isMultiAccessor(type)) config.y = child.accessors
      else config.y = child.accessors[0]
      if (type === 'ScatterPlot') config.size = child.accessors[0].size

      let component = this._composite.get(`${this.id}-${child.key}`)
      if (component) component.config.set(config, {silent: true})
      else {
        component = this._composite.add({
          type,
          config,
          model: this.model,
          container: this._container,
        })
        component.d3.classed(this.selectorClass('node'), true)
          .attr('clip-path', `url(#${this.id}-${this.selectors.plot})`)
        component.el.__data__ = {key: child.key}
      }

      component.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
      const axisName = this.config.getAxisName(child.accessors)
      let calculatedDomain = this.config.get(`axes.${axisName}.calculatedDomain`) || []
      calculatedDomain = d3Array.extent(calculatedDomain.concat(component.config.get('y.scale').domain()))
      this.config.set(`axes.${axisName}.calculatedDomain`, calculatedDomain, {silent: true})
    })

    children.exit().each(child => {
      this._composite.remove(`${this.id}-${child.key}`)
    })
  }
}
