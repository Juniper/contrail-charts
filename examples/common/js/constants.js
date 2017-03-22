/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import {schemeCategory10 as d3ColorScheme10, schemeCategory20 as d3ColorScheme20} from 'd3-scale'

const lbColorScheme7 = [
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#4caf50',
  '#0cc2aa',
  '#6cc788',
  '#6887ff'
]

const lbColorScheme17 = [
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#4caf50',
  '#0cc2aa',
  '#6cc788',
  '#6887ff',
  '#f06292'
].concat(d3ColorScheme10)

const bubbleColorScheme6 = [
  '#3f51b5',
  d3ColorScheme10[1],
  d3ColorScheme10[0],
  d3ColorScheme10[2],
  '#424242',
  '#9c27b0'
]

const bubbleColorScheme13 = [
  '#424242',
  '#9c27b0',
  '#3f51b5'
].concat(d3ColorScheme10)

const radialColorScheme6 = [
  '#00bcd4',
  '#4caf50',
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#c62828',
]

const radialColorScheme10 = [
  '#3f51b5',
  d3ColorScheme10[0],
  d3ColorScheme10[2],
  '#9c27b0',
  '#00bcd4',
  '#4caf50',
  '#a88add',
  '#fcc100',
  '#2196f3',
  '#c62828',
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
