/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
const _ = require('lodash')
const request = require('request')
const auth = {
  user: process.env.SAUCE_USERNAME,
  pass: process.env.SAUCE_ACCESS_KEY,
}

const startTestsUrl = `https://saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/js-tests`
const resultUrl = `https://saucelabs.com/rest/v1/${process.env.SAUCE_USERNAME}/js-tests/status`

var sauceId
request.post(startTestsUrl, {
  auth,
  json: {
    platforms: [
      ['Windows 8.1', 'chrome', '58'],
    ],
    url: 'http://localhost:8080/tests/TestRunner.html',
    framework: 'custom',
  }
}, (error, response, body) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  sauceId = _.get(body, 'js tests[0]')
  setTimeout(getResult, 2000)
})

function getResult () {
  request.post(resultUrl, {auth, json: {'js tests': [sauceId]}},
    ('response', (error, response, body) => {
      if (error) {
        console.error(error)
        process.exit(1)
      }
      if (!body.completed) {
        process.stdout.write('.')
        setTimeout(getResult, 2000)
      } else if (!_.get(body, 'js tests[0].result.passed')) {
        console.error('Tests failed')
        process.exit(1)
      }
    })
  )
}
