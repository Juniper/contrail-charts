/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class ControlPanelConfigModel extends ContrailChartsConfigModel {
  get menuItems () {
    return {
      Refresh: {
        title: 'Refresh chart',
        icon: 'icon-refresh',
      },
      Freeze: {
        title: 'Stop Live Update',
        icon: 'icon-stop',
      },
      Unfreeze: {
        title: 'Start Live Update',
        icon: 'icon-play',
      },
      ColorPicker: {
        title: 'Select color for serie',
        icon: 'icon-color',
      },
      Filter: {
        title: 'Select serie to show',
        icon: 'icon-eye',
      }
    }
  }
}
