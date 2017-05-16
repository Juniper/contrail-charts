/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/* global $ */

import '../sass/contrail-charts-examples.scss'
import _ from 'lodash'
// LineBar
import legend from '../../linebar-chart/legend'
import controls from '../../linebar-chart/control-panel'
import timeline from '../../linebar-chart/timeline'
import tooltips from '../../linebar-chart/tooltip'
import stackedBar from '../../linebar-chart/stacked-bar-chart'
import groupedBar from '../../linebar-chart/grouped-bar-chart'
import liveData from '../../linebar-chart/live'
// Scatter
import scatterPlotBuckets from '../../bubble-chart/bucketization'
import shapes from '../../bubble-chart/multiple-shapes'
import map from '../../bubble-chart/map'
// Radial
import pieChart from '../../radial-chart/pie'
import dendrogramChart from '../../radial-chart/dendrogram'
import areaBasic from '../../area-chart/basic'
// Grouped
import navigation from '../../grouped-chart/navigation'
import twoLineBarOnePieNav from '../../grouped-chart/linebar-pie-nav'

import sankeyChart from '../../advance-chart/sankey'
// Single
import singleLine from '../../single/single-line'
import singleStackedBar from '../../single/single-stacked-bar'
import singleGroupedBar from '../../single/single-grouped-bar'
import singleArea from '../../single/single-area'
import singleScatterPlot from '../../single/single-scatter-plot'
import singlePie from '../../single/single-pie'
import singleComposite from '../../single/single-composite-y'
/**
 * structure of an example:
 * 'example title': {
 *   view: instance of chart view <= required
 *   description: demonstrated features
 * }
 */
const allExamples = {
  'lineBar': {
    'Legend': {
      view: legend,
    },
    'Controls': {
      view: controls,
    },
    'Timeline': {
      view: timeline,
    },
    'Tooltips': {
      view: tooltips,
    },
    'Stacked Bar': {
      view: stackedBar,
    },
    'Grouped Bar': {
      view: groupedBar,
    },
    'RequireJS': {
      view: {
        type: 'RJS',
        entryPoint: './examples/linebar-chart/requirejs/requirejs-config.js'
      }
    },
    'Live Data': {
      view: liveData,
    }
  },
  'bubble': {
    'Buckets': {
      view: scatterPlotBuckets,
    },
    'Shapes': {
      view: shapes,
    },
    'Map': {
      view: map,
    },
  },
  'radial': {
    'Pie Chart': {
      view: pieChart,
    },
    'Dendrogram': {
      view: dendrogramChart,
    }
  },
  'area': {
    'Basic': {
      view: areaBasic,
    }
  },
  'single': {
    'Line Chart': {
      view: singleLine,
    },
    'Grouped Bar Chart': {
      view: singleGroupedBar,
    },
    'Stacked Bar Chart': {
      view: singleStackedBar,
    },
    'Area Chart': {
      view: singleArea,
    },
    'Scatter Plot': {
      view: singleScatterPlot,
    },
    'Pie Chart': {
      view: singlePie,
      desc: `After 2 seconds the chart is set with changed config and then updated with new data`,
    },
    'Composite Y Chart': {
      view: singleComposite,
    },
  },
  'grouped': {
    'Navigation': {
      view: navigation,
      desc: `Grouped chart with Navigation component for all of them. </br>
      First line chart in second row is not updated as it is plotted with different values at x axis`,
    },
    '2 LineBar 1 Pie Nav': {
      view: twoLineBarOnePieNav,
      desc: `All charts except first are updated by navigation component. </br>
      Crosshair for the first chart needs container specified in it's config as there are more than one shared svg in this chart`,
    }
  },
  'advance': {
    'Sankey': {
      view: sankeyChart,
    },
  }
}

$('.nav-sidebar').metisMenu()
$('.mobilebar .navbar-toggle').on('click', e => {
  e.preventDefault()
  $('body').addClass('showmenu')
})
$('.overlay').on('click', e => {
  e.preventDefault()
  $('body').removeClass('showmenu')
})

const $content = $('.crailui__content')
const $chartBox = $('#chartBox')

_.forEach(allExamples, (examples, chartCategory) => {
  let $links = $(`#${chartCategory}Links`)
  _.forEach(examples, (example, title) => {
    example.title = title
    example.category = chartCategory
    var $link = createLink(example)
    $links.append($('<li>').append($link))
  })
})

function _viewRenderInit ({view, title = '', desc = ''}) {
  let currentView = $chartBox.data('chartView')
  if (currentView) {
    currentView.remove()
    if (currentView.stopUpdating) currentView.stopUpdating()
  }

  $content.find('#page-title').text(title)
  $content.find('#page-description').html(desc)
  $chartBox.empty()
  // set current view
  $chartBox.data('chartView', view)
  view.render()
}

function createLink (example) {
  const chartType = example.category || ''
  const view = example.view
  const cleaned = encodeURIComponent(example.title.replace(/\s/g, ''))
  const link = `<a class="${chartType}${cleaned}" href="#${chartType}${cleaned}">
    <span class="nav-text">${example.title}</span>
    </a>`
  const $link = $(link)
  if (view.type === 'RJS') {
    $link.click(e => _initRJS(example))
  } else {
    $link.click(e => _viewRenderInit(example))
  }
  return $link
}

function _initRJS (example) {
  const RJSInitFlag = 'RJSInstantiated'
  const view = example.view
  if (view.status && view.status === RJSInitFlag) {
    _viewRenderInit(example)
  } else {
    // Load the entry point
    let entryPoint = document.createElement('script')
    entryPoint.src = 'node_modules/requirejs/require.js'
    entryPoint.setAttribute('data-main', view.entryPoint)
    document.body.append(entryPoint)
    // Once the require entry point load is complete (not just the file load but all dependencies),
    // the script callback will invoke render callback.
    window.AMDRenderCB = (RJSChartView) => {
      example.view = _.extend({status: RJSInitFlag}, view, RJSChartView)
      _viewRenderInit(example)
    }
  }
}

const exampleName = window.location.hash.substr(1) || 'groupedNavigation'
$('.' + exampleName).find('span').click()
