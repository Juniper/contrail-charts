/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var _ = require('lodash')
var d3 = require('d3')
var ContrailChartsConfigModel = require('contrail-charts-config-model')

/**
* This CrosshairConfigModel is designed to prepare data for CrosshairView based on the CompositeYChartView.
*/
var CrosshairConfigModel = ContrailChartsConfigModel.extend({
  defaults: {
    duration: 100,
    bubbleR: 5,

    findDataElem: function (mouseScreenX, data, componentView) {
      var xScale = componentView.params.axis[componentView.params.plot.x.axis].scale
      var xAccessor = componentView.params.plot.x.accessor
      var mouseX = xScale.invert(mouseScreenX)
      var xBisector = d3.bisector(function (d) {
        return d[xAccessor]
      }).right
      var indexRight = xBisector(data, mouseX, 0, data.length - 1)
      var indexLeft = indexRight - 1
      if (indexLeft < 0) indexLeft = 0
      var index = indexRight
      if (Math.abs(mouseX - data[indexLeft][xAccessor]) < Math.abs(mouseX - data[indexRight][xAccessor])) {
        index = indexLeft
      }
      return data[index]
    },

    prepareRenderInfo: function (componentView) {
      var renderInfo = { circles: [] }
      var globalXScale = componentView.params.axis[componentView.params.plot.x.axis].scale
      // Prepare crosshair bounding box
      renderInfo.x1 = componentView.params.xRange[0]
      renderInfo.x2 = componentView.params.xRange[1]
      renderInfo.y1 = componentView.params.yRange[1]
      renderInfo.y2 = componentView.params.yRange[0]
      // Prepare x label formatter
      renderInfo.xFormat = componentView.config.get('axis')[componentView.params.plot.x.axis].formatter
      if (!_.isFunction(renderInfo.xFormat)) {
        renderInfo.xFormat = d3.timeFormat('%H:%M')
      }
      // Prepare line coordinates
      renderInfo.line = {}
      renderInfo.line.x = function (dataElem) {
        return globalXScale(dataElem[componentView.params.plot.x.accessor])
      }
      renderInfo.line.y1 = componentView.params.yRange[0]
      renderInfo.line.y2 = componentView.params.yRange[1]
      // Preoare x label text
      renderInfo.line.text = function (dataElem) {
        return renderInfo.xFormat(dataElem[componentView.params.plot.x.accessor])
      }
      // Prepare circle data
      _.each(componentView._drawings, function (plotTypeComponent) {
        _.each(plotTypeComponent.params.activeAccessorData, function (accessor) {
          var circleObject = {}
          circleObject.id = accessor.accessor
          circleObject.x = function (dataElem) {
            return plotTypeComponent.getScreenX(dataElem, componentView.params.plot.x.accessor)
          }
          circleObject.y = function (dataElem) {
            return plotTypeComponent.getScreenY(dataElem, accessor.accessor)
          }
          circleObject.color = accessor.color
          renderInfo.circles.push(circleObject)
        })
      })
      return renderInfo
    }
  }
})

module.exports = CrosshairConfigModel
