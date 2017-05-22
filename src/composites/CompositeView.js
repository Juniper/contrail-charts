/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ChartView from 'chart-view'
import CompositeChart from 'helpers/CompositeChart'
import * as Models from 'models'
import TitleView from 'helpers/title/TitleView'
/**
 * This view enables creation of composited visualization out of multiple components
 */
export default class CompositeView extends ChartView {
  setData (data) {
    this.composite.setData(data)
  }
  /**
   * As CompositeView doesn't render anything itself its id is used as container HTML element id
   * while for all other components id of component is used as its element id due to Backbone.View
   */
  setConfig (config) {
    if (!this.composite) this.composite = new CompositeChart()

    // if config specified create common model for all components to prepare (format) data just once
    if (config.model && config.model.type) {
      const Model = Models[config.model.type]
      if (Model) this._model = new Model(config.model.config)
    }

    // TODO any component should not access global DOM scope via document
    this._container = config.container || document.querySelector('#' + config.id)
    // Apply template
    if (config.template) {
      const template = document.createElement('template')
      template.innerHTML = config.template()
      // some components require container to have id
      _.each(template.content.querySelectorAll(`[component]`), el => {
        el.setAttribute('id', 'cc-' + el.getAttribute('component'))
      })
      this._container.append(document.importNode(template.content, true))
    }

    if (config.title) TitleView(this._container, config.title)

    // TODO add ability to update / remove components in composition

    _.each(config.components, (component, index) => {
      component.config.id = component.id
      component.model = component.model || this._model
      // component id is used to find its container in template
      component.container = this._container.querySelector(`[component="${component.id}"]`) || this._container
      component.config.order = index
    })

    _.each(config.components, component => { this.composite.add(component) })
  }

  render () {
    _.each(this.composite.components, component => component.render())
  }

  remove () {
    this.composite.remove()
  }
}
