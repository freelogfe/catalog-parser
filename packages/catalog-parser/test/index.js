const fs = require('fs')
const path = require('path')
const assert = require('assert')
const parser = require('..')

require('should')

describe('catalog parser testcase', function () {
  const dirname = __dirname
  it('test right case', function () {
    const rightDir = fs.readFileSync(path.join(dirname, 'fixtures/widget-catalog')).toString()
    var result = parser(rightDir)
    result.should.have.length(6)
  })

  it('test error case', function () {
    const errorDir = fs.readFileSync(path.join(dirname, 'fixtures/error-catalog')).toString()
    try {
      parser(errorDir)
    } catch (e) {
      assert.ok(e.message.indexOf('error indent') > -1)
    }
  })
})

