/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import {schemeCategory10 as d3ColorScheme10, schemeCategory20 as d3ColorScheme20} from 'd3-scale'

const lbColorScheme7 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
  '#6CBD70',
  '#EA8235',
  '#F44455',
  '#F77A99'
]

const lbColorScheme17 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
  '#6CBD70',
  '#EA8235',
  '#F44455',
  '#F77A99',
  '#9CB0C5'
].concat(d3ColorScheme10)

const bubbleColorScheme6 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
  '#6CBD70',
  '#EA8235',
  '#F44455'
]

const bubbleColorScheme13 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
].concat(d3ColorScheme10)

const radialColorScheme6 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
  '#6CBD70',
  '#EA8235',
  '#F44455',
]

const radialColorScheme10 = [
  '#3F51B5',
  '#2196F3',
  '#0FBFAD',
  '#6CBD70',
  '#EA8235',
  '#F44455',
  '#F77A99',
  '#9CB0C5',
  '#6686A6',
  '#374B60',
]

export default {
  bubbleColorScheme6,
  bubbleColorScheme13,
  lbColorScheme7,
  lbColorScheme17,
  radialColorScheme6,
  radialColorScheme10,
  d3ColorScheme10,
  d3ColorScheme20
}
