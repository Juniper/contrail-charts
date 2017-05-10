/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
import _ from 'lodash'
import ConfigModel from 'config-model'

export default class ControlPanelConfigModel extends ConfigModel {
  get menuItems () {
    return {
      Refresh: {
        title: 'Refresh chart',
        icon: 'fa fa-refresh',
      },
      Freeze: {
        action: 'ToggleFreeze',
        attribute: 'frozen',
        toggle: true,
        title: 'Stop Live Update',
        icon: 'fa fa-stop',
      },
      Unfreeze: {
        action: 'ToggleFreeze',
        attribute: 'frozen',
        toggle: false,
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

  set (key, value, options) {
    if (_.isString(key) && !this.attributes[key]) {
      const currentActionId = _.findKey(this.menuItems, item => {
        return item.attribute === key && item.toggle === value
      })
      const oppositeId = _.findKey(this.menuItems, item => {
        return item.attribute === key && item.toggle === !value
      })

      const menuItem = _.find(this.attributes.menu, item => item.id === currentActionId)

      menuItem.id = oppositeId
      this.trigger('change')
    } else super.set(key, value, options)
  }
}
