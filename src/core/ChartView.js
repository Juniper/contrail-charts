/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import ContrailView from 'contrail-view'
import ConfigModel from 'config-model'
import DataModel from 'models/Data'
import actionman from 'core/Actionman'
import ToggleHalt from '../actions/ToggleHalt'
/**
 * View base class
 */
export default class ChartView extends ContrailView {
  /**
   * @param {HTMLElement} p.container must be specified
   */
  constructor (p = {}) {
    super(p)
    this._id = p.id || _.get(p, 'config.id')
    this.d3.attr('id', this.id)
    this._container = p.container

    // override simple Backbone.View model set
    const Model = this.constructor.Model || DataModel
    if (!this.model || !(this.model instanceof Model)) {
      if (p.model instanceof Model) this.model = p.model
      else this.model = new Model(undefined, p.model)
      if (!p.config.frozen) this.listenTo(this.model, 'change', this._onDataModelChange || this.render)
    }
    this.setConfig(p.config)
    // overwrite _onResize handler with instance specific one
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
    _.each(this.constructor.Actions, action => actionman.set(action, this))
    actionman.set(ToggleHalt, this)
  }

  get selectors () {
    return {
      chart: '.cc-chart',
      component: '.cc-component',
      svgWrapper: '.svg-wrapper',
      svg: '.cc-svg',
      sharedSvg: '.shared-svg',
      node: '.node',
      interactive: '.interactive',
      active: '.active',
    }
  }

  get events () {
    return {
      'click node': '_onEvent',
      'dblclick node': '_onEvent',
    }
  }

  get zIndex () { return 0 }
  /**
   * @return {String} id provided by config or Backbone generated
   */
  get id () {
    return this._id || this.cid
  }
  /**
   * Backbone tries to set id while initialization
   */
  set id (id) {
    // do nothing
  }
  // Component is master by default
  get isMaster () {
    const isMaster = this.constructor.isMaster
    return _.isNil(isMaster) ? true : isMaster
  }
  /**
   * @returns {Object} d3.selection - Looks for svg container
   */
  get svg () {
    let selector = ''
    if (this.config.get('isSharedContainer')) {
      // this components uses shared svg container
      selector = `#${this._container.id} > ${this.selectors.svgWrapper} > svg${this.selectors.svg}${this.selectors.sharedSvg}`
    } else {
      // this component is standalone
      if (this.isTagNameSvg(this.tagName)) {
        // this component is pure svg
        selector = `#${this._container.id} > #${this.id}-svg-wrapper > svg${this.selectors.svg}`
      } else {
        // this component may have shared container inside
        selector = `#${this._container.id} > #${this.id} > ${this.selectors.svgWrapper} > svg${this.selectors.svg}${this.selectors.sharedSvg}`
      }
    }
    return this.container.select(selector)
  }
  /**
   * @return {Object} d3 selection - container to render into
   */
  get container () {
    return d3Selection.select(this._container)
  }
  /**
   * One-time setter
   * Container cannot be changed from outside
   */
  set container (el) {
    if (!this._container) this._container = el
  }
  /**
   * Calculate offset of svg relative to the container
   */
  get svgOffset () {
    const left = this.svg.node().getBoundingClientRect().left - this._container.getBoundingClientRect().left
    const top = this.svg.node().getBoundingClientRect().top - this._container.getBoundingClientRect().top
    return {left, top}
  }
  /**
   * Padding depends on view size and rendered data
   */
  get padding () {
    return this.config.padding
  }
  /**
   * @return {Number} width of the component container
   * This is total available width to take for rendering own element into
   */
  get width () {
    return this.config.get('width') || this._container.getBoundingClientRect().width
  }
  /**
   * @return {Number} width in px
   */
  get innerWidth () {
    const margin = this.config.margin
    return this.width - margin.left - margin.right
  }
  /**
   * @return {Number} width in px of the plot area
   */
  get plotWidth () {
    const padding = this.padding
    return this.innerWidth - padding.left - padding.right
  }
  /**
   * @return {Number} height of the component container
   * This is total available height to take for rendering own element into
   */
  get height () {
    return this.config.get('height') || Math.round(this.width / 2)
  }
  /**
   * @return {Number} height in px
   */
  get innerHeight () {
    const margin = this.config.margin
    return this.height - margin.top - margin.bottom
  }
  /**
   * @return {Number} height in px of the plot area
   */
  get plotHeight () {
    const padding = this.padding
    return this.innerHeight - padding.top - padding.bottom
  }
  /**
  * @param {Array} data
  */
  setData (data) {
    this.model.data = data
  }
  /**
   * Sets the configuration for this component as a simple object
   * or already instantiated ConfigModel of corresponding type.
   *
   * Calling setConfig on already rendered chart will update the chart.
   */
  setConfig (config = {}) {
    const Config = this.constructor.Config || ConfigModel
    if (config instanceof Config) this.config = config
    else {
      if (!this.config) {
        // clone config as this object may be changed outside and passed again
        config = _.cloneDeep(config)

        // View and Config model share the same id - "Component id"
        config.id = this.id
        this.config = new Config(config)
        if (!this.config.get('frozen')) this.listenTo(this.config, 'change', this.render)
      } else {
        this.config.set(config)
      }
    }
  }
  /**
   * Appends components element to container in the order specified in this._order
   *
   * Components which renders vector graphics should call super.render() firsthand
   * in order to initialize shared svg container if missing and append this.el to it
   * Thus this.element will be ready to animate other entering elements
   *
   * Components rendering html should call super.render() at the end to increase performance by less browser redraw
   * @param {String} content to insert into element's html
   */
  render (content) {
    if (this.isTagNameSvg(this.tagName)) {
      this._initSvg()
      if (this.svg.select(`#${this.id}`).empty()) {
        this.el.setAttribute('data-order', this.zIndex)
        this.svg.node().append(this.el)
      }
      const offset = {
        left: this.config.margin.left + this.padding.left,
        top: this.config.margin.top + this.padding.top,
      }
      this.d3.attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`)
    } else {
      // non vector components
      if (content) this.el.innerHTML = content
      this._insertSorted(this.el)
    }
  }
  /**
   * Shortcut to set container, data and config
   */
  show (data, config = {}) {
    this._visible = true
    if (config.container) this._container = config.container
    this.config.set(config, {silent: true})
    this.setData(data)
    this.d3.classed('hide', false)
  }
  /**
   * Visually hide own element
   */
  hide () {
    this.d3.classed('hide', true)
    this._visible = false
  }
  /**
   * Set / Remove any automatic update by public methods or actions
   * TODO consider halted state
   */
  setFrozen (isFrozen) {
    if (this.config.get('frozen') === isFrozen) return
    this.config.set('frozen', isFrozen, {silent: true})
    if (isFrozen) {
      this.stopListening(this.config)
      this.stopListening(this.model)
      _.each(this.constructor.Actions, action => actionman.unset(action, this))
    } else {
      this.listenTo(this.config, 'change', this.render)
      this.listenTo(this.model, 'change', this._onDataModelChange || this.render)
      _.each(this.constructor.Actions, action => actionman.set(action, this))
    }
  }
  /**
   * Unsubscribe component from model updates
   * TODO actually the model should stop updating its public "data" attribute
   */
  setHalt (isHalted) {
    if (this.config.get('halted') === isHalted) return
    this.config.set('halted', isHalted, {silent: true})
    if (isHalted) {
      this.stopListening(this.model)
    } else {
      this.listenTo(this.model, 'change', this._onDataModelChange || this.render)
    }
  }
  /**
   * This is more like destroy component.
   * Stop listening to config and model. Remove the view from the dom.
   */
  remove () {
    if (this.config) this.stopListening(this.config)
    // TODO this.config should unsubscribe all dependent components
    // and there will be no need to do clear silently
    this.config.clear({silent: true})
    if (this.model) this.stopListening(this.model)
    window.removeEventListener('resize', this._onResize)
    _.each(this.constructor.Actions, action => actionman.unset(action, this))

    super.remove()
  }
  /**
   * First component which uses shared svg container appends svg element to container
   * There is a div wrapper on top of svg to workaround FF bug, when svg data-order attribute is not set
   */
  _initSvg () {
    const isSharedContainer = this.config.get('isSharedContainer')
    if (this.svg.empty()) {
      const wrapper = document.createElement('div')
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      wrapper.appendChild(svg)
      svg.classList.add(this.selectorClass('svg'))
      if (isSharedContainer) {
        svg.classList.add(this.selectorClass('sharedSvg'))
      } else {
        // create wrapper for this component only
        wrapper.setAttribute('id', `${this.id}-svg-wrapper`)
      }
      wrapper.classList.add(this.selectorClass('svgWrapper'))
      this._insertSorted(wrapper)
    }
    const wrapperPosition = this.svg.node().parentNode.dataset.order
    if (this.config.get('isPrimary') && wrapperPosition !== this.config.get('order')) {
      const wrapper = this.svg.node().parentNode
      wrapper.remove() // detach
      this._insertSorted(wrapper)
    }
    this.svg
      .classed(this.selectorClass('sharedSvg'), isSharedContainer)
      .attr('width', this.width)
      .attr('height', this.height)
  }
  /**
   * Insert own element into the DOM in the specified order
   */
  _insertSorted (el) {
    if (el.parentElement === this._container) return

    if (!this.config.get('isSharedContainer') || this.config.get('isPrimary')) {
      el.dataset['order'] = this.config.get('order')
    }
    el.classList.add(this.selectorClass('component'))
    this._container.appendChild(el)
    if (this._container.childElementCount > 1 && this.config.has('order')) {
      this.container
        .selectAll(`#${this._container.id} > ${this.selectors.component}`)
        .datum(function () { return this.dataset['order'] })
        .sort()
        .datum(null)
    }
  }

  // Event handlers

  _onResize () {
    if (!this._ticking) {
      window.requestAnimationFrame(this.render.bind(this))
      this._ticking = true
    }
  }

  _onEvent (d, el, e) {
    const elementName = _.invert(this.selectors)['.' + el.classList[0]]
    const cb = this.config.getAction(elementName, e.type)
    if (_.isFunction(cb)) cb(d.data)
  }
}
