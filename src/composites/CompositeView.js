/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailChartsView from 'contrail-charts-view'
import CompositeChart from 'helpers/CompositeChart'
import TitleView from 'helpers/title/TitleView'
/**
 * This view enabled creation of composed visualization out of multiple components
 */
export default class CompositeView extends ContrailChartsView {
  setData (data) {
    this._composite.setData(data)
  }
  /**
   * As CompositeView doesn't render anything itself its id is used as container HTML element id
   * while for all other components id of component is used as it's element id due to Backbone.View
   */
  setConfig (config) {
    if (!this._composite) this._composite = new CompositeChart()
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

    // TODO add ability to change components in composition: add / remove

    _.each(config.components, (component, index) => {
      // component id is used to find its container in template
      component.container = this._container.querySelector(`[component="${component.id}"]`) || this._container
      component.config.id = component.id
      component.config.order = index
    })
    const [dependent, independent] = _.partition(config.components, c => c.config.sourceComponent)
    _.each(independent, component => this._composite.add(component))
    _.each(dependent, component => {
      const sourceComponent = this._composite.get(component.config.sourceComponent)
      component.model = sourceComponent.model
      const componentView = this._composite.add(component)
      componentView.config.parent = sourceComponent.config
    })
  }

  render (p) {
    this._composite.render()
  }

  remove (p) {
    this._composite.remove()
  }
}
