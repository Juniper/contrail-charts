[![Build Status](https://circleci.com/gh/absingla/contrail-charts/tree/master.svg?style=shield&circle-token=59e6876b319241f9dd809aa2a7399b6edac92e66)](https://circleci.com/gh/Juniper/contrail-charts)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Contrail Charts

A chart library by Contrail using D3 and Backbone. Please see [contrail-charts-demo](https://github.com/Juniper/contrail-charts-demo) for more examples using this library.

### Getting Started

#### Prerequisites

Node version > 6

#### Installation

If you are using NPM, use

`npm install contrail-charts`

Otherwise, download the latest release and run the following command. 

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.  

`npm install`

To build, use

`npm run build`

You'll find the `js` and `css` under `build/` directory. 

#### Development

For dev environment, use

`npm run dev`

This will build and load the examples on browser at [http://localhost:9000](http://localhost:9000).

To run unit tests, use

`npm run test`

Under CI infrastructure, we use phantomjs. If you want to run under headless browser: 

`npm install -g phantomjs-prebuilt` and do `npm run test-headless`

#### Documentation

Refer [documentation](https://github.com/Juniper/contrail-charts/wiki) for different types of charts, components and 
their config options. 

### Examples

#### Line Bar Chart

![Line Bar Chart](images/linebar-chart.png)

#### Radial Dendrogram Chart

![Radial Dendrogram Chart](images/radial-dendrogram.png)

#### Area Chart

![Area Chart](images/area-chart.png)

#### Bubble Chart

![Bubble Chart](images/bubble-chart.png)

#### Bubble Map

![Bubble Map](images/bubble-map.png)

#### Grouped Chart

![Grouped Chart](images/grouped-chart.png)


#### Sankey Chart

![Sankey Chart](images/sankey-chart.png)


### Authors

* [Adrian Dmitra](https://github.com/Dmitra)
* [Daniel Osman](https://github.com/danielosman)
* [Sarin Kizhakkepurayil](https://github.com/skizhak)
* [Zheyang Song](https://github.com/ZheyangSong)
* [Abhishek Singla](https://github.com/absingla)

### License

This project is licensed under Apache Version 2.0 - see the [LICENSE](LICENSE) file for details

### Contribution

* Sign the [Contributor License Agreement](https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=cf81ffe2-5694-4ad8-9d92-334fc57a8a7c)

* Guidelines for commit logs

    * Start commit message with a short (~50 characters) 1-line summary paragraph i.e. a single very brief line followed by a blank line. Rest of the commit log can be zero or more paragraphs. Each line within a paragraph should be <= 72 characters.

    * Include a Github issue number by adding Closes #NNN. For more details please read Github [help](https://help.github.com/articles/closing-issues-via-commit-messages/). 