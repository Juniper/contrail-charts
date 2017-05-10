/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global cc, describe, it, expect */
describe('cc', function () {
  it('cc is defined', function () {
    expect(cc).toBeDefined()
  })

  it('cc has components, models, helpers', function () {
    expect(cc.components.TooltipConfigModel).toBeDefined()
    expect(cc.components.TooltipView).toBeDefined()
    expect(cc.models.Serie).toBeDefined()
    expect(cc.models.DataFrame).toBeDefined()
    expect(cc.composites.CompositeView).toBeDefined()
    expect(cc.composites.CompositeYConfigModel).toBeDefined()
    expect(cc.composites.CompositeYView).toBeDefined()
  })
})

