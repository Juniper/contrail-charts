/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var $ = require('jquery')
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsView = require('contrail-charts-view')
var LineChartView = require('components/composite-y/LineChartView')
var AreaChartView = require('components/composite-y/AreaChartView')
var BarChartView = require('components/composite-y/GroupedBarChartView')
var StackedBarChartView = require('components/composite-y/StackedBarChartView')
var ScatterBubbleChartView = require('components/composite-y/ScatterBubbleChartView')

var CompositeYChartView = ContrailChartsView.extend({
  type: 'compositeY',
  tagName: 'div',
  className: 'coCharts-xy-chart',

  initialize: function (options) {
    var self = this
    ContrailChartsView.prototype.initialize.call(self, options)
    // TODO: Every model change will trigger a redraw. This might not be desired - dedicated redraw event?
    // / View params hold values from the config and computed values.
    self._debouncedRenderFunction = _.bind(_.debounce(self._render, 10), self)
    self.listenTo(self.model, 'change', self._onDataModelChange)
    self.listenTo(self.config, 'change', self._onConfigModelChange)
    self.name = options.name || 'compositeY'
    self._onWindowResize()
    self.listenTo(self._eventObject, 'selectColor', self.selectColor)
    self.listenTo(self._eventObject, 'refresh', self.refresh)
  },

  // Action handler
  selectColor: function (accessorName, color) {
    var self = this
    var configAccessor = _.find(self.config.get('plot').y, function (a) { return a.accessor === accessorName })
    if (configAccessor) {
      configAccessor.color = color
      self.config.trigger('change', self.config)
    }
  },

  refresh: function () {
    this.config.trigger('change', this.config)
  },

  changeModel: function (model) {
    var self = this
    self.stopListening(self.model)
    self.model = model
    self.listenTo(self.model, 'change', self._onDataModelChange)
    _.each(self._drawings, function (drawing) {
      drawing.model = model
    })
    self._onDataModelChange()
  },

  _onWindowResize: function () {
    var self = this
    var throttled = _.throttle(function () {
      self.render()
    }, 100)
    $(window).resize(throttled)
  },

  resetParams: function () {
    // Reset parents params
    this.params = this.config.initializedComputedParameters()
    // Reset params for all children.
    // This way every child drawing can have access to parents config and still have its own computed params stored in config.
    _.each(this._drawings, function (drawing, i) {
      drawing.resetParamsForChild(i)
    })
  },

  possibleChildViews: {
    line: LineChartView,
    area: AreaChartView,
    bar: BarChartView,
    stackedBar: StackedBarChartView,
    scatterBubble: ScatterBubbleChartView
  },

  /**
  * Update the drawings array based on the plot.y.
  */
  _updateChildDrawings: function () {
    var self = this
    var plot = self.config.get('plot')
    self._drawings = []
    if (!plot.x.axis) {
      // Default x axis name.
      plot.x.axis = 'x'
    }
    _.each(plot.y, function (accessor) {
      if (!accessor.axis) {
        // Default y axis name.
        accessor.axis = 'y'
      }
      if (!_.has(accessor, 'enabled')) {
        accessor.enabled = true
      }
      if (accessor.chart && accessor.enabled) {
        var drawingName = accessor.axis + '-' + accessor.chart
        var foundDrawing = _.find(self._drawings, function (drawing) { return drawing.getName() === drawingName })
        if (!foundDrawing) {
          // The child drawing with this name does not exist yet. Instantiate the child drawing.
          _.each(self.possibleChildViews, function (ChildView, chartType) {
            if (chartType === accessor.chart) {
              // TODO: a way to provide a different model to every child
              // TODO: pass eventObject to child?
              foundDrawing = new ChildView({
                model: self.model,
                config: self.config,
                eventObject: self._eventObject,
                el: self.el,
                axisName: accessor.axis,
                parent: self
              })
              self._drawings.push(foundDrawing)
            }
          })
        }
      }
    })
    // Order the drawings so the highest order drawings get rendered first.
    self._drawings.sort(function (a, b) { return b.renderOrder - a.renderOrder })
  },

  getColor: function (accessor) {
    var self = this
    if (_.has(accessor, 'color')) {
      return accessor.color
    } else {
      return self.params.colorScale(accessor.accessor)
    }
  },

  /**
  * Calculates the activeAccessorData that holds only the verified and enabled accessors from the 'plot' structure.
  * Params: activeAccessorData, yAxisInfoArray
  */
  calculateActiveAccessorData: function () {
    var self = this
    self.params.activeAccessorData = []
    self.params.yAxisInfoArray = []
    // Initialize the drawings activeAccessorData structure
    _.each(self._drawings, function (drawing) {
      drawing.params.activeAccessorData = []
      drawing.params.enabled = false
    })
    // Fill the activeAccessorData structure.
    _.each(self.params.plot.y, function (accessor) {
      var drawing = self.getDrawing(accessor.axis, accessor.chart)
      if (drawing) {
        if (accessor.enabled) {
          self.params.activeAccessorData.push(accessor)
          var foundAxisInfo = _.find(self.params.yAxisInfoArray, { name: accessor.axis })
          var axisPosition = self.hasAxisParam(accessor.axis, 'position') ? self.params.axis[accessor.axis].position : 'left'
          if (!foundAxisInfo) {
            foundAxisInfo = {
              name: accessor.axis,
              used: 0,
              position: axisPosition,
              num: 0,
              accessors: []
            }
            self.params.yAxisInfoArray.push(foundAxisInfo)
          }
          foundAxisInfo.used++
          foundAxisInfo.accessors.push(accessor.accessor)
          if (accessor.chart) {
            // Set the activeAccessorData to the appropriate drawings.
            if (drawing) {
              drawing.params.activeAccessorData.push(accessor)
              drawing.params.enabled = true
            }
          }
        }
      }
    })
  },

  /**
   * Calculates the chart dimensions and margins.
   * Use the dimensions provided in the config. If not provided use all available width of container and 3/4 of this width for height.
   * This method should be called before rendering because the available dimensions could have changed.
   * Params: chartWidth, chartHeight, margin, marginTop, marginBottom, marginLeft, marginRight, marginInner.
   */
  calculateDimmensions: function () {
    var self = this
    if (!self.params.chartWidth) {
      self.params.chartWidth = self.$el.width()
    }
    if (self.params.chartWidthDelta) {
      self.params.chartWidth += self.params.chartWidthDelta
    }
    if (!self.params.chartHeight) {
      self.params.chartHeight = Math.round(self.params.chartWidth / 2)
    }
    if (!self.params.margin) {
      self.params.margin = 5
    }
    if (!self.params.marginInner) {
      self.params.marginInner = 0
    }
    // TODO: use the 'axis' param to compute additional margins for the axis
    var sides = ['Top', 'Right', 'Bottom', 'Left']
    _.each(sides, function (side) {
      if (!self.params['margin' + side]) {
        self.params['margin' + side] = self.params.margin
      }
    })
  },

  /**
   * Use the scales provided in the config or calculate them to fit data in view.
   * Assumes to have the range values available in the DataProvider (model) and the chart dimensions available in params.
   * Params: xRange, yRange, xDomain, yDomain, xScale, yScale
   */
  calculateScales: function () {
    var self = this
    // Calculate the starting and ending positions in pixels of the chart data drawing area.
    self.params.xRange = [self.params.marginLeft + self.params.marginInner, self.params.chartWidth - self.params.marginRight - self.params.marginInner]
    self.params.yRange = [self.params.chartHeight - self.params.marginInner - self.params.marginBottom, self.params.marginInner + self.params.marginTop]
    self.saveScales()
    // Now let every drawing perform it's own calculations based on the provided X and Y scales.
    _.each(self._drawings, function (drawing) {
      if (_.isFunction(drawing.calculateScales)) {
        drawing.calculateScales()
      }
    })
  },

  calculateColorScale: function () {
    var self = this
    self.params.colorScale = this.config.get('colorScale') || d3.scaleOrdinal(d3.schemeCategory20)
    _.each(self.params.plot.y, function (accessor) {
      accessor.color = self.getColor(accessor)
    })
  },

  getDrawing: function (axisName, chartType) {
    var self = this
    var foundDrawing = null
    var drawingName = axisName + '-' + chartType
    _.each(self._drawings, function (drawing) {
      if (drawing.getName() === drawingName) {
        foundDrawing = drawing
      }
    })
    return foundDrawing
  },

  /*
  getDrawings: function (axisName) {
    var self = this
    var foundDrawings = []
    _.each(self._drawings, function (drawing) {
      if (_.contains(drawing.params.handledAxisNames, axisName)) {
        foundDrawings.push(drawing)
      }
    })
    return foundDrawings
  },
  */

  /**
  * Combine the axis domains (extents) from all enabled drawings.
  */
  combineAxisDomains: function () {
    var self = this
    var domains = {}
    _.each(self._drawings, function (drawing) {
      if (drawing.params.enabled) {
        var drawingDomains = drawing.calculateAxisDomains()
        _.each(drawingDomains, function (domain, axisName) {
          if (!_.has(domains, axisName)) {
            domains[axisName] = [domain[0], domain[1]]
          } else {
            // check if the new domains extent extends the current one
            if (domain[0] < domains[axisName][0]) {
              domains[axisName][0] = domain[0]
            }
            if (domain[1] > domains[axisName][1]) {
              domains[axisName][1] = domain[1]
            }
          }
          // Override axis domain based on axis config.
          if (self.hasAxisParam(axisName, 'domain')) {
            if (!_.isUndefined(self.config.get('axis')[axisName].domain[0])) {
              domains[axisName][0] = self.config.get('axis')[axisName].domain[0]
            }
            if (!_.isUndefined(self.config.get('axis')[axisName].domain[1])) {
              domains[axisName][1] = self.config.get('axis')[axisName].domain[1]
            }
          }
        })
      }
    })
    return domains
  },

  /**
  * Save all scales in the params and drawing.params structures.
  */
  saveScales: function () {
    var self = this
    var domains = self.combineAxisDomains()
    if (!_.has(self.params, 'axis')) {
      self.params.axis = {}
    }
    _.each(domains, function (domain, axisName) {
      if (!_.has(self.params.axis, axisName)) {
        self.params.axis[axisName] = {}
      }
      if (!self.hasAxisParam(axisName, 'position')) {
        // Default axis position.
        if (axisName.charAt(0) === 'x') {
          self.params.axis[axisName].position = 'bottom'
        } else if (axisName.charAt(0) === 'y') {
          self.params.axis[axisName].position = 'left'
        }
      }
      if (!self.hasAxisParam(axisName, 'range')) {
        if (['bottom', 'top'].indexOf(self.params.axis[axisName].position) >= 0) {
          self.params.axis[axisName].range = self.params.xRange
        } else if (['left', 'right'].indexOf(self.params.axis[axisName].position) >= 0) {
          self.params.axis[axisName].range = self.params.yRange
        }
      }
      self.params.axis[axisName].domain = domain
      if (!_.isFunction(self.params.axis[axisName].scale) && self.params.axis[axisName].range) {
        var baseScale = null
        if (self.hasAxisConfig(axisName, 'scale') && _.isFunction(d3[self.config.get('axis')[axisName]])) {
          baseScale = d3[self.params.axis[axisName].scale]()
        } else if (['bottom', 'top'].indexOf(self.params.axis[axisName].position) >= 0) {
          baseScale = d3.scaleTime()
        } else {
          baseScale = d3.scaleLinear()
        }
        self.params.axis[axisName].scale = baseScale.domain(self.params.axis[axisName].domain).range(self.params.axis[axisName].range)
        if (self.hasAxisParam(axisName, 'nice') && self.params.axis[axisName].nice) {
          if (self.hasAxisParam(axisName, 'ticks')) {
            self.params.axis[axisName].scale = self.params.axis[axisName].scale.nice(self.params.axis[axisName].ticks)
          } else {
            self.params.axis[axisName].scale = self.params.axis[axisName].scale.nice()
          }
        }
      }
    })
    // Now update the scales of the appropriate drawings.
    _.each(self._drawings, function (drawing) {
      drawing.params.axis = self.params.axis
    })
  },

  /**
   * Renders the svg element with axis and drawing groups.
   * Resizes chart dimensions if chart already exists.
   */
  renderSVG: function () {
    var self = this
    var translate = self.params.xRange[0] - self.params.marginInner
    var rectClipPathId = 'rect-clipPath-' + self.el.id
    var svgs = d3.select(self.el).select('svg')
    if (svgs.empty()) {
      var svg = d3.select(self.el).append('svg').attr('class', 'coCharts-svg')
      svg.append('clipPath')
        .attr('id', rectClipPathId)
        .append('rect')
        .attr('x', self.params.xRange[0] - self.params.marginInner)
        .attr('y', self.params.yRange[1] - self.params.marginInner)
        .attr('width', self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner)
        .attr('height', self.params.yRange[0] - self.params.yRange[1] + 2 * self.params.marginInner)
      svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + (self.params.yRange[1] - self.params.marginInner) + ')')
    }
    // Handle Y axis
    var svgYAxis = self.svgSelection().selectAll('.axis.y-axis').data(self.params.yAxisInfoArray, function (d) {
      return d.name
    })
    svgYAxis.exit().remove()
    svgYAxis.enter()
      .append('g')
      .attr('class', function (d) { return 'axis y-axis ' + d.name + '-axis' })
      .merge(svgYAxis)
      .attr('transform', 'translate(' + translate + ',0)')
    // Handle drawing groups
    var svgDrawingGroups = self.svgSelection().selectAll('.drawing-group').data(self._drawings, function (c) {
      return c.getName()
    })
    svgDrawingGroups.enter().append('g')
      .attr('class', function (drawing) {
        return 'drawing-group drawing-' + drawing.getName() + ' ' + drawing.className
      })
      .attr('clip-path', 'url(#' + rectClipPathId + ')')
    // Every drawing can add a one time (enter) code into it's drawing group.
    svgDrawingGroups.enter().each(function (drawing) {
      if (_.isFunction(drawing.renderSVG)) {
        d3.select(this).select('.drawing-' + drawing.getName()).call(drawing.renderSVG)
      }
    })
    svgDrawingGroups.exit().remove()
    // Handle (re)size.
    self.svgSelection()
      .attr('width', self.params.chartWidth)
      .attr('height', self.params.chartHeight)
      .select('#' + rectClipPathId).select('rect')
      .attr('x', self.params.xRange[0] - self.params.marginInner)
      .attr('y', self.params.yRange[1] - self.params.marginInner)
      .attr('width', self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner)
      .attr('height', self.params.yRange[0] - self.params.yRange[1] + 2 * self.params.marginInner)
  },

  hasAxisConfig: function (axisName, axisAttributeName) {
    var self = this
    var axis = self.config.get('axis')
    return _.isObject(axis) && _.isObject(axis[axisName]) && !_.isUndefined(axis[axisName][axisAttributeName])
  },

  hasAxisParam: function (axisName, axisAttributeName) {
    var self = this
    return _.isObject(self.params.axis) && _.isObject(self.params.axis[axisName]) && !_.isUndefined(self.params.axis[axisName][axisAttributeName])
  },

  /**
   * Renders the axis.
   */
  renderAxis: function () {
    var self = this
    var xAxisName = self.params.plot.x.axis
    var xAxis = d3.axisBottom(self.params.axis[xAxisName].scale)
      .tickSize(self.params.yRange[0] - self.params.yRange[1] + 2 * self.params.marginInner)
      .tickPadding(10)
    if (self.hasAxisParam('x', 'ticks')) {
      xAxis = xAxis.ticks(self.params.axis[xAxisName].ticks)
    }
    if (self.hasAxisConfig('x', 'formatter')) {
      xAxis = xAxis.tickFormat(self.config.get('axis').x.formatter)
    }
    var svg = self.svgSelection().transition().ease(d3.easeLinear).duration(self.params.duration)
    svg.select('.axis.x-axis').call(xAxis)
    // X axis label
    var xLabelData = []
    var xLabelMargin = 5
    if (self.hasAxisParam(xAxisName, 'labelMargin')) {
      xLabelMargin = self.params.axis[xAxisName].labelMargin
    }
    var xLabel = self.params.plot.x.labelFormatter || self.params.plot.x.label
    if (self.hasAxisParam(xAxisName, 'label')) {
      xLabel = self.params.axis[xAxisName].label
    }
    if (xLabel) {
      xLabelData.push(xLabel)
    }
    var xAxisLabelSvg = self.svgSelection().select('.axis.x-axis').selectAll('.axis-label').data(xLabelData)
    xAxisLabelSvg.enter()
      .append('text')
      .attr('class', 'axis-label')
      .merge(xAxisLabelSvg) // .transition().ease( d3.easeLinear ).duration( self.params.duration )
      .attr('x', self.params.xRange[0] + (self.params.xRange[1] - self.params.xRange[0]) / 2)
      .attr('y', self.params.chartHeight - self.params.marginTop - xLabelMargin)
      .text(function (d) { return d })
    xAxisLabelSvg.exit().remove()
    // We render the yAxis here because there may be multiple drawings for one axis.
    // The parent has aggregated information about all Y axis.
    var referenceYScale = null
    var yLabelX = 0
    var yLabelTransform = 'rotate(-90)'
    _.each(self.params.yAxisInfoArray, function (axisInfo) {
      var yLabelMargin = 12
      if (self.hasAxisParam(axisInfo.name, 'labelMargin')) {
        yLabelMargin = self.params.axis[axisInfo.name].labelMargin
      }
      yLabelX = 0 - self.params.marginLeft + yLabelMargin
      yLabelTransform = 'rotate(-90)'
      if (axisInfo.position === 'right') {
        yLabelX = self.params.chartWidth - self.params.marginLeft - yLabelMargin
        yLabelTransform = 'rotate(90)'
        axisInfo.yAxis = d3.axisRight(self.params.axis[axisInfo.name].scale)
          .tickSize((self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner))
          .tickPadding(5)
      } else {
        axisInfo.yAxis = d3.axisLeft(self.params.axis[axisInfo.name].scale)
          .tickSize(-(self.params.xRange[1] - self.params.xRange[0] + 2 * self.params.marginInner))
          .tickPadding(5)
      }
      if (self.hasAxisParam(axisInfo.name, 'ticks')) {
        axisInfo.yAxis = axisInfo.yAxis.ticks(self.params.axis[axisInfo.name].ticks)
      }
      if (!referenceYScale) {
        referenceYScale = self.params.axis[axisInfo.name].scale
      } else {
        // This is not the first Y axis so adjust the tick values to the first axis tick values.
        var ticks = referenceYScale.ticks(self.params.yTicks)
        if (self.hasAxisParam(axisInfo.name, 'ticks')) {
          ticks = referenceYScale.ticks(self.params.axis[axisInfo.name].ticks)
        }
        var referenceTickValues = _.map(ticks, function (tickValue) {
          return axisInfo.yAxis.scale().invert(referenceYScale(tickValue))
        })
        axisInfo.yAxis = axisInfo.yAxis.tickValues(referenceTickValues)
      }
      if (self.hasAxisConfig(axisInfo.name, 'formatter')) {
        axisInfo.yAxis = axisInfo.yAxis.tickFormat(self.config.get('axis')[axisInfo.name].formatter)
      }
      svg.select('.axis.y-axis.' + axisInfo.name + '-axis').call(axisInfo.yAxis)
      // Y axis label
      var yLabelData = []
      var i = 0
      // There will be one label per unique accessor label displayed on this axis.
      _.each(axisInfo.accessors, function (key) {
        var foundActiveAccessorData = _.find(self.params.activeAccessorData, { accessor: key })
        if (!foundActiveAccessorData) return
        var label = foundActiveAccessorData.labelFormatter || foundActiveAccessorData.label
        if (!label) return
        var foundYLabelData = _.find(yLabelData, { label: label })
        if (!foundYLabelData) {
          var yLabelXDelta = 12 * i
          if (axisInfo.position === 'right') {
            yLabelXDelta = -yLabelXDelta
          }
          yLabelData.push({ label: label, x: yLabelX + yLabelXDelta })
          i++
        }
      })
      var yAxisLabelSvg = self.svgSelection().select('.axis.y-axis.' + axisInfo.name + '-axis').selectAll('.axis-label').data(yLabelData, function (d) { return d.label })
      yAxisLabelSvg.enter()
        .append('text')
        .attr('class', 'axis-label')
        .merge(yAxisLabelSvg) // .transition().ease( d3.easeLinear ).duration( self.params.duration )
        // .attr( "x", yLabelX )
        // .attr( "y", self.params.yRange[1] + (self.params.yRange[0] - self.params.yRange[1]) / 2 )
        .attr('transform', function (d) { return 'translate(' + d.x + ',' + (self.params.yRange[1] + (self.params.yRange[0] - self.params.yRange[1]) / 2) + ') ' + yLabelTransform })
        .text(function (d) { return d.label })
      yAxisLabelSvg.exit().remove()
    })
  },

  renderData: function () {
    var self = this
    _.each(self._drawings, function (drawing) {
      drawing.renderData()
    })
  },

  _onDataModelChange: function () {
    this.render()
  },

  _onConfigModelChange: function () {
    this.render()
  },

  _render: function () {
    var self = this
    self._updateChildDrawings()
    self.resetParams()
    self.calculateActiveAccessorData()
    self.calculateDimmensions()
    self.calculateScales()
    self.calculateColorScale()
    self.renderSVG()
    self.renderAxis()
    self.renderData()
    self._eventObject.trigger('rendered:' + self.name, self.params, self.config, self)
  },

  render: function () {
    var self = this
    if (self.config) {
      self._debouncedRenderFunction()
    }
    return self
  }
})

module.exports = CompositeYChartView
