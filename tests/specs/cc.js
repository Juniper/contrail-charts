/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/* global cc, describe, it, expect */
describe('cc', function () {
  it('cc is defined', function () {
    expect(cc).toBeDefined()
  })

  it('cc has components, providers, helpers', function () {
    expect(cc.components.TooltipConfigModel).toBeDefined()
    expect(cc.components.TooltipView).toBeDefined()
    expect(cc.providers.SerieProvider).toBeDefined()
    expect(cc.providers.DataFrameProvider).toBeDefined()
    expect(cc.composites.CompositeView).toBeDefined()
    expect(cc.composites.CompositeYConfigModel).toBeDefined()
    expect(cc.composites.CompositeYView).toBeDefined()
  })
})

