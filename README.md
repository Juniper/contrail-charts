[![Build Status](https://travis-ci.org/Juniper/contrail-charts.svg?branch=master)](https://travis-ci.org/Juniper/contrail-charts)

# Contrail Charts

A chart library in MVC using D3

# Installation

simply do
```
npm install contrail-charts
```
Alternatively, you can clone this repo and
```
npm install
```
To build
```
npm run build
```
you'll find the `js` and `css` under `build/` directory

Or, download from our releases.

# Demo
Let's dive in and create some charts!

when contrail-charts is included via script tag, you can use coCharts from window.
Our library also supports including via requirejs. Refer our examples for samples

Let's assume we've a time-series data
```javascript
     // CPU-MEM Time series data.
     var tsData = [
       { ts: 1475760930000, mem: 0, cpu: 10 },
       { ts: 1475761930000, mem: 3, cpu: 20 },
       { ts: 1475762930000, mem: 2, cpu: 15 },
       { ts: 1475763930000, mem: 4, cpu: 30 },
       { ts: 1475764930000, mem: 5, cpu: 40 }
     ]
```
And we need to plot a line chart for memory 'mem' data over time 'ts'

```javascript
    // Initialize a XYChartView
    var xyChartView = new coCharts.charts.XYChartView()

    // Let's set the chart config.
    xyChartView.setConfig({
        xyChart: {
          el: '#cpumemChart', //Element Id
          plot: {
            x: {
              accessor: 'ts' // Field name to use on x
            },
            y: [
              {
                accessor: 'mem', // Field name to use on y
                chart: 'line' // Type of the chart
              }
            ]
          }
        }
    })

    // Set the time series data to chart view.
    simpleChartView.setData(tsData)

    // Render it.
    simpleChartView.render()
```


Nice, but the axis is missing. Let's add it. Update the config with axis

```javascript
    axis: {
        y1: {
            label: 'Memory',
            position: 'left'
        }
    }
```
and use them inside your plot.y config
```javascript
    ...
    y: [
      {
        accessor: 'mem', // Field name to use on y
        chart: 'line' // Type of the chart
        axis: y1 // Axis to plot this field on
      }
    ]
    ...
```

Let's make it more interesting. Add cpu data also in the same chart, but let's use bar
```javascript
    ....
    // Add new axis.
    axis: {
            y1: {
                label: 'Memory',
                position: 'left'
            },
            y2: {
                label: 'CPU',
                position: 'right'
            }
        }

    ...
    // Update the accessors.
    y: [
      {
        accessor: 'mem', // Field name to use on y
        chart: 'line' // Type of the chart
        axis: y1 // Axis to plot this field on
      },
      {
          accessor: 'cpu', // Field name to use on y
          chart: 'stackedBar' // Type of the chart
          axis: y2 // Axis to plot this field on
        }

    ]
    ...
```

Using the same XYChartView we can render line, bar and zoom charts. Head over to examples for more!
