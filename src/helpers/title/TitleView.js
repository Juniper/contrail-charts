/*
 * Copyright (c) Juniper Networks, Inc. All rights reserved.
 */
/*
 * Simple title rendering
 */
import './title.scss'

module.exports = function TitleView (container, text) {
  const selector = '.cc-title'
  const el = container.querySelector(selector) || document.createElement('div')
  el.classList.add(selector.substr(1))
  el.innerHTML = text
  container.prepend(el)
}
