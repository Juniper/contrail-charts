/* global describe, it, expect, browser, beforeAll, afterAll */
import _ from 'lodash'

describe('Example pages', function () {
  afterAll(done => {
    browser.end(done)
  })
  describe('LineBarLegend Page', () => {
    it('Should not have any severe errors in console', done => {
      browser.url('/#lineBarLegend')
      var logs = browser.log('browser').value
      expect(_.find(logs, {level: 'SEVERE'})).toBe(undefined)
      browser.call(done)
    })
  })
})
