/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */

import {schemeCategory10 as d3ColorScheme10, schemeCategory20 as d3ColorScheme20, schemeCategory20c as d3ColorScheme20c} from 'd3-scale'

/*
const lbColorScheme7 = [
  '#1f77b4',
  '#aec7e8',
  '#ff7f0e',
  '#ffbb78',
  '#2ca02c',
  '#98df8a',
  '#d62728'
]

const lbColorScheme17 = [
  '#1f77b4',
  '#aec7e8',
  '#ff7f0e',
  '#ffbb78',
  '#2ca02c',
  '#98df8a',
  '#d62728',
  '#ff9896'
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
  '#c62828'
]  

const radialColorScheme10 = [
  lbColorScheme7[0],
  lbColorScheme7[1],
  lbColorScheme7[4],
  lbColorScheme7[2],
  lbColorScheme7[3],
  lbColorScheme7[5],
  lbColorScheme7[6],
  '#ff9896',
  '#9467bd',
  '#c5b0d5'
] */

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
