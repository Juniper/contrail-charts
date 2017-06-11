/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import {schemeCategory10 as d3ColorScheme10, schemeCategory20 as d3ColorScheme20, schemeCategory20c as d3ColorScheme20c} from 'd3-scale'

const palette = d3ColorScheme20

const paletteSoft = [
  '#3182bd',
  '#6baed6',
  '#9ecae1',
  '#c6dbef',
  '#e6550d',
  '#fd8d3c',
  '#fdae6b',
  '#fdd0a2',
  '#31a354',
  '#74c476',
  '#a1d99b',
  '#c7e9c0',
  '#756bb1',
  '#9e9ac8',
  '#bcbddc',
  '#dadaeb',
  '#636363',
  '#969696',
  '#bdbdbd',
  '#d9d9d9'
]

export default {
  /*bubbleColorScheme6,
  bubbleColorScheme13,
  lbColorScheme7,
  lbColorScheme17,
  radialColorScheme6,
  radialColorScheme10, */
  d3ColorScheme10,
  d3ColorScheme20,
  paletteSoft,
  palette
}
