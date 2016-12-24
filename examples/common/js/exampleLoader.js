/**
 * Update following to add a new example.
 * @type {*[]}
 */
var examples = [
  {
    html: 'composite-xy/composite-xy.html',
    js: 'composite-xy/composite-xy.js',
    css: 'composite-xy/composite-xy.css',
    title: 'Line Bar chart with Control panel'
  },
  {
    html: 'multi-chart/multi-chart.html',
    js: 'multi-chart/multi-chart.js',
    css: 'multi-chart/multi-chart.css',
    title: 'Multi Chart with Focus'
  },
  {
    html: 'bubble/bubble.html',
    js: 'bubble/bubble.js',
    css: 'bubble/bubble.css',
    title: 'Bubble Chart'
  },
  {
    html: 'area/area.html',
    js: 'area/area.js',
    css: 'area/area.css',
    title: 'Area Chart'
  },
  {
    html: 'pie/pie.html',
    js: 'pie/pie.js',
    css: 'pie/pie.css',
    title: 'Pie Chart'
  },
  {
    html: 'requirejs/requirejs.html',
    js: 'requirejs/app/example1.js',
    css: 'requirejs/app/example1.css',
    title: 'Using RequireJS'
  },
  {
    html: 'linebar/linebar.html',
    js: 'linebar/linebar.js',
    css: 'linebar/linebar.css',
    title: 'Line Bar chart (CPU/Mem)'
  },
  {
    html: 'composite-xy-timeline/composite-xy-timeline.html',
    js: 'composite-xy-timeline/composite-xy-timeline.js',
    css: 'composite-xy-timeline/composite-xy-timeline.css',
    title: 'Simple Timeline navigation'
  }
]

var $exampleLinks = $('#exampleLinks')
for (var i = 0; i < examples.length; i++) {
  var $link = $('<a href="#' + i + '" class="link">' + examples[i].title + '</a>')
  $link.click(sideBarLinkOnClick)
  $exampleLinks.append($('<li>').append($link))
}

function sideBarLinkOnClick (e) {
  var index = $(this).attr('href').split('#')[1]
  var example = examples[index]
  $('#outputView').find('.output-demo-iframe').attr('src', example.html)
  // Todo: Fix html code display
  // $('#htmlContent').find('.source-html-iframe')
  $('#jsContent').find('.source-js-iframe').attr('src', example.js)
  $('#cssContent').find('.source-css-iframe').attr('src', example.css)
}
