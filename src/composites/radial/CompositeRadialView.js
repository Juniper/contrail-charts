/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Array from 'd3-array'
import ChartView from 'chart-view'
import Config from './CompositeRadialConfigModel'
import Model from 'models/DataFrame'
import CompositeChart from 'helpers/CompositeChart'
import actionman from 'core/Actionman'
import SelectColor from '../../actions/SelectColor'
import SelectKey from '../../actions/SelectKey'
import './radial.scss'

/**
 * Creates composited chart with X and Y axes and compatible components like: Line, Area, StackedBar, etc
 */
export default class CompositeRadialView extends ChartView {
  static get Config () { return Config }
  static get Model () { return Model }
  static get Actions () { return { SelectColor, SelectKey } }

  constructor (...args) {
    super(...args)
    this._composite = new CompositeChart()
  }

  get tagName () { return 'g' }

  get selectors () {
    return _.extend(super.selectors, {
      node: '.child',
      axis: '.radial-axis',
      clip: 'clipPath',
    })
  }

  get height () {
    return this.config.get('height') || this.width
  }

  render () {
    super.render()
    this._updateComponents()
    this.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
    this._renderAxes()

    // force composite scale for children components
    // and inform them that it is a provided scale so they will not overwrite.
    const components = this._composite.getByType(_(this.config.activeAccessors).map('chart').uniq().value())
    _.each(components, component => {
      const componentAngularAxisName = this.config.getAngularAxisName(component.config.get('angular'))
      component.config.set('angular.scale', this.config.get(`axes.${componentAngularAxisName}.scale`), {silent: true})
      component.config.set('angular.providedScale', true, {silent: true})
      const componentRadialAxisName = this.config.getRadialAxisName(component.config.get('radial'))
      component.config.set('radial.scale', this.config.get(`axes.${componentRadialAxisName}.scale`), {silent: true})
      component.config.set('radial.providedScale', true, {silent: true})
      component.render()
    })
    this._showLegend()

    this._ticking = false
  }

  remove () {
    this._composite.remove()
    super.remove()
  }

  /**
   * Render axes and calculate inner margins for charts
   */
  _renderAxes () {
    const allAxes = _.concat(this.config.activeAngularAxes, this.config.activeRadialAxes)
    const elements = this.svg.selectAll(this.selectors.axis)
      .data(allAxes, d => d.name)

    elements.enter().each(axis => {
      const component = this._composite.add({
        type: 'RadialAxis',
        config: this.config.getAxisConfig(axis.name),
        container: this._container,
      })
      component.el.__data__ = axis
    })

    elements.each(axis => {
      const component = this._composite.get(axis.id)
      // if only a scale is changed Backbone doesn't trigger "change" event and no render will happen
      component.config.set(this.config.getAxisConfig(axis.name), {silent: true})
      component.render()
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
    }

    // reset calculated values from previous render
    _.each(this.config.accessors, accessor => {
      const angularAxisName = this.config.getAngularAxisName(accessor)
      this.config.set(`axes.${angularAxisName}.calculatedDomain`, undefined, {silent: true})
      const radialAxisName = this.config.getRadialAxisName(accessor)
      this.config.set(`axes.${radialAxisName}.calculatedDomain`, undefined, {silent: true})
    })

    const children = this.svg.selectAll(this.selectors.node)
      .data(this.config.children, d => d.key)

    children.enter().merge(children).each(child => {
      const type = this.config.getComponentType(child.accessor)
      config.id = `${this.id}-${child.key}`
      config.angular = _.merge({}, child.accessor)
      config.radial = _.merge({}, child.accessor)
      config.angular.accessor = child.accessor.angular
      config.angular.axis = child.accessor.angularAxis
      config.radial.accessor = child.accessor.radial
      config.radial.axis = child.accessor.radialAxis
      config.tooltip = child.accessor.tooltip
      config.barPadding = child.accessor.barPadding

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
        // TODO clipping .attr('clip-path', `url(#${this.id}-${this.selectors.clip})`)
        component.el.__data__ = {key: child.key}
      }

      component.config.calculateScales(this.model, this.innerWidth, this.innerHeight)
      const angularAxisName = this.config.getAngularAxisName(child.accessor)
      let calculatedDomain = this.config.get(`axes.${angularAxisName}.calculatedDomain`) || []
      calculatedDomain = d3Array.extent(calculatedDomain.concat(component.config.get('angular.calculatedDomain')))
      this.config.set(`axes.${angularAxisName}.calculatedDomain`, calculatedDomain, {silent: true})
      const radialAxisName = this.config.getRadialAxisName(child.accessor)
      calculatedDomain = this.config.get(`axes.${radialAxisName}.calculatedDomain`) || []
      calculatedDomain = d3Array.extent(calculatedDomain.concat(component.config.get('radial.calculatedDomain')))
      this.config.set(`axes.${radialAxisName}.calculatedDomain`, calculatedDomain, {silent: true})
    })

    children.exit().each(child => {
      this._composite.remove(`${this.id}-${child.key}`)
    })
  }

  _showLegend () {
    const legendId = this.config.get('legend')
    if (!legendId) return

    const config = {
      colorScheme: this.config.get('colorScheme'),
      //chartTypes: this.config.get('chartTypes'),
    }
    const data = _.map(this.config.accessors, accessor => {
      return {
        key: `${accessor.angular}-${accessor.radial}`,
        disabled: accessor.disabled,
        label: this.config.getLabel(undefined, accessor),
        color: this.config.getColor(accessor),
        chartType: config.chartTypes ? accessor.chart : undefined,
        axis: accessor.axis,
        shape: accessor.shape,
      }
    })
    actionman.fire('ToggleVisibility', legendId, true, data, config)
  }
}
