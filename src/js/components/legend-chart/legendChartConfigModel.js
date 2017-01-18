const ContrailChartsConfigModel = require('contrail-charts-config-model')

const LegendChartConfigModel = ContrailChartsConfigModel.extend({
	defaults: {
		// TODO: alignment can either be horizontal or vertical
		alignment: 'horizontal'
	},

	setParent: function (model) {
		this._parent = model
		model.on('change', () => { this.trigger('change') })
	},

	getData: function () {
		const accessors = this._parent.getAccessors()
		const data = {}
		data.attributes = _.map(accessors, (accessor) => {
			return {
				key: accessor.accessor,
				label: this.getLabel(undefined, accessor),
				color: this._parent.getColor(accessor),
				checked: accessor.enabled
			}
		})

		return data
	}
})

module.exports = LegendChartConfigModel