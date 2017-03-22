/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import ContrailChartsConfigModel from 'contrail-charts-config-model'

export default class ControlPanelConfigModel extends ContrailChartsConfigModel {
  get menuItems () {
    return {
      Refresh: {
        title: 'Refresh chart',
        icon: 'fa fa-refresh',
      },
      Freeze: {
        title: 'Stop Live Update',
        icon: 'fa fa-stop',
      },
      Unfreeze: {
        title: 'Start Live Update',
        icon: 'fa fa-play',
      },
      ColorPicker: {
        title: 'Select color for serie',
        icon: 'fa fa-eyedropper',
      },
      Filter: {
        title: 'Select serie to show',
        icon: 'fa fa-filter',
      }
    }
  }
}
