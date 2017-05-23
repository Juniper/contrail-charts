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
        icon: 'icon-refresh',
      },
      Halt: {
        action: 'ToggleHalt',
        attribute: 'halted',
        toggle: true,
        title: 'Stop Live Update',
        icon: 'icon-stop',
      },
      Start: {
        action: 'ToggleHalt',
        attribute: 'halted',
        toggle: false,
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

  get update () {
    return this.attributes.update.concat([this.id])
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
