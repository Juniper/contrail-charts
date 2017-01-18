const $ = require('jquery')
const _ = require('lodash')
const ContrailChartsView = require('contrail-charts-view')
const _template = require('./legendTemplate.html')

var LegendChartView = ContrailChartsView.extend({
	type: 'legendChart',
	className: 'legend-chart',
	events: {
		'change .legend-attribute': '_toggleAttribute',
		'click .edit': '_toggleLegendEditMode'
	},

	initialize: function (options) {
		var self = this
	    ContrailChartsView.prototype.initialize.call(self, options)
	    self.listenTo(self.config, 'change', self.render)
	},

	render: function () {
		const template = this.config.get('template') || _template
    	const content = $(template(this.config.getData()))

    	ContrailChartsView.prototype.render.call(this, content)
	},

	_toggleAttribute: function (e) {
		var self = this

		var target = $(e.currentTarget)
		var inputCheckbox = target.find('input[type=checkbox]')
		var isChecked = inputCheckbox.prop('checked')
		var plot = self.config.get('plot')
		var key = target.attr('data-value')

		var indicator = target.find('.indicator')
		var accessor = _.find(plot.y, { accessor: key })

		if(accessor) {
			accessor.enabled = isChecked
			self.config.trigger('change:plot')
		}
	},

	_toggleLegendEditMode: function (e) {
		// TODO: change button text

		this.$el.find('.legend-attribute').toggleClass('edit')
	}
})

module.exports = LegendChartView