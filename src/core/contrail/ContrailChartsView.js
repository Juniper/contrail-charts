/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import * as d3Selection from 'd3-selection'
import ContrailView from 'contrail-view'
import * as Providers from 'providers'
import ContrailChartsConfigModel from 'contrail-charts-config-model'
import actionman from 'core/Actionman'
import ToggleFreeze from '../../actions/ToggleFreeze'
/**
 * View base class
 */
export default class ContrailChartsView extends ContrailView {
  constructor (p = {}) {
    super(p)
    this._id = p.id || _.get(p, 'config.id')
    this.d3.attr('id', this.id)
    this._order = p.order
    this._container = p.container
    // TODO remove
    this.params = {}

    const Provider = Providers[this.constructor.dataType + 'Provider']
    if (Provider) {
      if (p.model instanceof Provider) this.model = p.model
      else this.model = new Provider(undefined, p.model)
    }
    this.setConfig(p.config)
    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
    if (this.model) actionman.set(ToggleFreeze, this)
    _.each(this.constructor.Actions, action => actionman.set(action, this))
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

  get width () {
    return this.config.get('width') || this._container.getBoundingClientRect().width
  }

  get innerWidth () {
    const margin = this.config.get('margin')
    return this.width - margin.left - margin.right
  }

  get height () {
    return this.config.get('height') || Math.round(this.width / 2)
  }

  get innerHeight () {
    const margin = this.config.get('margin')
    return this.height - margin.top - margin.bottom
  }
  /**
  * @param {Array} data
  */
  setData (data) {
    if (this.config.get('frozen')) return
    this.model.data = data
  }

  setConfig (config) {
    const ConfigModel = this.constructor.Config || ContrailChartsConfigModel
    if (ConfigModel) {
      if (config instanceof ConfigModel) this.config = config
      else {
        if (!this.config) {
          // clone config as this object may be changed outside and passed again
          config = _.cloneDeep(config)
          this.config = new ConfigModel(config)
          this.listenTo(this.config, 'change', this.render)
        } else {
          this.config.set(config)
        }
      }
    }
  }
  /**
   * Save the config '_computed' parameters in the view's 'params' local object for easier reference (this.params instead of this.config._computed).
   * The view may modify the params object with calculated values.
   */
  // TODO deprecate
  resetParams (params) {
    if (params) this.config.set(params)
    this.params = this.config.computeParams()
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
        // TODO constrain selector to direct descendants ":scope > g"
        //this.svg
          //.selectAll('g[data-order]')
          //.datum(function () { return this.getAttribute('data-order') })
          //.sort()
          //.datum(null)
      }
      const margin = this.config.get('margin')
      this.d3.attr('transform', `translate(${margin.left},${margin.top})`)
    } else {
      // non vector components
      if (content) this.el.innerHTML = content
      this._insertSorted(this.el)
    }
  }

  show (container) {
    if (this._container !== container) {
      this._container = container
      this.render()
    }
    this.d3.classed('hide', false)
    this._visible = true
  }

  hide () {
    this.d3.classed('hide', true)
    this._visible = false
  }
  /**
   * Stop listening to config and model. Remove the view from the dom.
   */
  remove () {
    if (this.config) this.stopListening(this.config)
    this.config.clear()
    if (this.model) this.stopListening(this.model)
    window.removeEventListener('resize', this._onResize)
    _.each(this.constructor.Actions, action => actionman.unset(action, this))

    // TODO remove
    this.params = {}
    super.remove()
  }
  /**
   * First component which uses shared svg container appends svg element to container
   * There is a div wrapper over svg to workaround FF bug, when svg data-order attribute is not set
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
    if (this.params.isPrimary && wrapperPosition !== this.config.get('order')) {
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
   * insert own element into the DOM in the right order
   */
  _insertSorted (el) {
    if (el.parentElement === this._container) return

    if (!this.config.get('isSharedContainer') || this.params.isPrimary) {
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
