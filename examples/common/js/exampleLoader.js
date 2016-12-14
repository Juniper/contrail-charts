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
  }
]

var $exampleLinks = $('#exampleLinks')
for (var i = 0; i < examples.length; i++) {
  var $link = $('<a href="#' + i + '" >' + examples[i].title + '</a>')
  $link.click(sideBarLinkOnClick)
  $exampleLinks.append($('<li class="link">').append($link))
}

function sideBarLinkOnClick (e) {
  var index = $(this).attr('href').split('#')[1]
  var example = examples[index]
  $('#htmlContent').find('.source-html-iframe').load(example.html)
  $('#jsContent').find('.source-js-iframe').attr('src', example.js)
  $('#cssContent').find('.source-css-iframe').attr('src', example.css)
  $('#outputView .output-iframe').attr('src', example.html)
}
