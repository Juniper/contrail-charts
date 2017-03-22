/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ContrailModel from 'contrail-model'

export default class BindingHandler extends ContrailModel {
  get defaults () {
    return {
      charts: {},
      bindings: [],
    }
  }
  /**
  * Saves information about a component in a chart.
  * This information will be used later in order to perform bindings defined in a configuration.
  */
  addComponent (chartId = 'default', componentName, component) {
    var savedChart = this.get('charts')[chartId]
    if (!savedChart) {
      savedChart = this.get('charts')[chartId] = {}
    }
    var savedComponent = savedChart[componentName] = {}
    savedComponent.config = component.config
    savedComponent.model = component.model
    savedComponent.events = component.eventObject
  }

  addBindings (bindings, defaultChartId) {
    defaultChartId = defaultChartId || 'default'
    _.each(bindings, (binding) => {
      if (!binding.sourceChart) {
        binding.sourceChart = defaultChartId
      }
      if (!binding.targetChart) {
        binding.targetChart = defaultChartId
      }
      this.get('bindings').push(binding)
    })
  }

  performSync (sourceModel, sourcePath, targetModel) {
    targetModel.set(sourcePath, sourceModel.get(sourcePath))
    if (_.isObject(sourceModel.get(sourcePath))) {
      // Perform manual event trigger.
      targetModel.trigger('change')
      targetModel.trigger('change:' + sourcePath)
    }
    this.listenToOnce(sourceModel, 'change:' + sourcePath, () => {
      this.performSync(sourceModel, sourcePath, targetModel)
    })
  }
  /**
  * Set all the bindings defined in the config.
  */
  start () {
    var charts = this.get('charts')
    _.each(this.get('bindings'), (binding) => {
      if (!binding.sourceChart && _.keys(charts).length === 1) {
        binding.sourceChart = _.keys(charts)[0]
      }
      if (!binding.targetChart && _.keys(charts).length === 1) {
        binding.targetChart = _.keys(charts)[0]
      }
      if (_.has(charts, binding.sourceChart) && _.has(charts, binding.targetChart)) {
        if (_.has(charts[binding.sourceChart], binding.sourceComponent) && _.has(charts[binding.targetChart], binding.targetComponent)) {
          if (_.has(charts[binding.sourceChart][binding.sourceComponent], binding.sourceModel) && _.has(charts[binding.targetChart][binding.targetComponent], binding.targetModel)) {
            var sourceModel = charts[binding.sourceChart][binding.sourceComponent][binding.sourceModel]
            var targetModel = charts[binding.targetChart][binding.targetComponent][binding.targetModel]
            if (binding.action === 'sync') {
              // Two way listen for changes and perform sync on startup.
              this.performSync(sourceModel, binding.sourcePath, targetModel)
              this.performSync(targetModel, binding.sourcePath, sourceModel)
            } else if (_.isFunction(binding.action)) {
              this.listenTo(sourceModel, binding.sourcePath, _.partial(binding.action, sourceModel, targetModel))
            }
          }
        }
      }
    })
  }
}
