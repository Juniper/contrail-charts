/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'

export default class TooltipConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, {
      // Which tooltip ids to accept. If empty accept all.
      acceptFilters: [],

      // place tooltip at the top of the cursor by default
      placement: 'vertical',

      sticky: false,
      // Default formatter to build tooltip content.
      formatter: (data) => {
        let tooltipContent = {}
        const dataConfig = this.get('dataConfig')
        const titleConfig = this.get('title')

        if (titleConfig) {
          tooltipContent.title = _.isString(titleConfig) ? titleConfig : this.getFormattedValue(data, titleConfig)
        }

        // Todo move out color to be class based.
        tooltipContent.color = this.get('color')
        tooltipContent.backgroundColor = this.get('backgroundColor')

        tooltipContent.items = _.map(dataConfig, datumConfig => {
          return {
            label: this.getLabel(data, datumConfig),
            value: this.getFormattedValue(data, datumConfig),
          }
        })
        return tooltipContent
      }
    })
  }

  get clip () {
    return this.attributes.clip
  }
  // TODO
  get stickyMargin () {
    return {left: 0, right: 0}
  }

  get position () {
    return {
      left: this.attributes.left,
      top: this.attributes.top,
    }
  }

  get height () {
    return this.attributes.height
  }
}
