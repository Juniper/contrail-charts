/* global cc, describe, it, expect, beforeEach afterEach */
describe('Legend Panel', () => {
  let config
  let legendPanel
  let data
  let container = document.querySelector('#chart')

  beforeEach(() => {
    data = [{
      key: 'x',
      label: 'first',
      color: 'red',
      chartType: 'GroupedBar',
      axis: 'y1'
    }, {
      key: 'a',
      label: 'second',
      color: 'green',
      chartType: 'Line',
      axis: 'y2'
    }]
    config = {
      chartTypes: {
        y1: ['GroupedBar', 'StackedBar'],
        y2: ['Line'],
      },
      editable: {
        color: true,
        chart: true,
      },
      filter: true,
    }
  })

  afterEach(() => {
    while (container.firstChild) { container.firstChild.remove() }
  })

  describe('Render with minimal config.', () => {
    it('should render panel', () => {
      config = {}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let panel = container.querySelector('.legend-panel')

      expect(panel).not.toBeNull()
    })

    it('should render two keys', () => {
      config = {}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let keys = container.querySelector('div.keys')
      expect(keys.length).toBe(2)
    })

    it('checked correctnes label', () => {
      config = {}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let labels = container.querySelectorAll('label.legend-key')
      _.each(labels, (label, i) => {
        let text = label.textContent
        let pattern = new RegExp(data[i].label, 'i')

        expect(pattern.test(text)).toBeTruthy()
      })
    })

    it('checked correctnes axis label', () => {
      config = {}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let axisLabels = container.querySelectorAll('span.associate-axis')
      _.each(axisLabels, (axisLabel, i) => {
        let text = axisLabel.textContent

        expect(text).toBe(data[i].axis)
      })
    })

    it('checked correctnes color', () => {
      config = {}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let colorIndicators = container.querySelectorAll('div.color-indicator')
      _.each(colorIndicators, (colorIndicator, i) => {
        let color = colorIndicator.style.backgroundColor
        expect(color).toBe(data[i].color)
      })
    })
  })

  describe('Render with non-default config.', () => {
    it('should be editable only color', () => {
      config.editable = {color: true}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)

      let selectColors = container.querySelectorAll('div.select--color')
      let selectCharts = container.querySelectorAll('div.select--chart')

      expect(selectColors.length).toBe(2)
      expect(selectCharts).toBeNull()
    })

    it('should be editable only chart', () => {
      config.editable = {chart: true}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)

      let selectColors = container.querySelectorAll('div.select--color')
      let selectCharts = container.querySelectorAll('div.select--chart')

      expect(selectCharts.length).toBe(2)
      expect(selectColors).toBeNull()
    })

    it('should disabled select keys', () => {
      config = {filter: false}
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      let checkBoxs = container.querySelectorAll('input[type="checkbox"]')
      _.each(checkBoxs, checkBox => {
        let disabled = checkBox.hasAttribute('disabled')
        expect(disabled).toBeTruthy()
      })
    })

    it('Correctness of the available chart type for the y1 axis', () => {
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      container.querySelector('div.edit-legend').click()
      container.querySelector('[data-key="x"] .select--chart').click()
      let switchCharts = container.querySelectorAll('.switch--chart')
      _.each(switchCharts, (switchChart, i) => {
        let dataAxis = switchChart.getAttribute('data-axis')
        if (dataAxis !== data[0].axis) {
          let childRect = switchChart.getBoundingClientRect()
          expect(childRect.width).toBe(0)
          expect(childRect.height).toBe(0)
        }
      })
    })

    it('panel should be editable after click on edit legend button', () => {
      legendPanel = new cc.components.LegendPanelView({config, container})
      legendPanel.setData(data)
      container.querySelector('.edit-legend').click()
      expect(container.querySelector('.legend-panel').classList.contains('edit-mode')).toBeTruthy()
      let keys = container.querySelectorAll('.key')
      _.each(keys, (key, i) => {
        expect(key.classList.contains('edit')).toBeTruthy()
      })
    })
  })
})