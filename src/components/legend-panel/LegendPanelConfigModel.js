/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'
import ColoredChart from 'helpers/color/ColoredChart'
/**
 * Legend Panel is a dependent component which retrieves its data from the parent
 */
export default class LegendPanelConfigModel extends ConfigModel {
  get defaults () {
    return _.merge(super.defaults, ColoredChart.defaults, {
      editable: {
        color: false,
        chart: false,
      },
      filter: true,
      placement: 'horizontal',
    })
  }
}
