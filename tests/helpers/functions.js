/**
 * This function run callback after DOM event on target element
 * @param type - attribute or element
 * @param el - target element
 * @param attrName - target attribute
 * @param callback
 */
function observer (type, el, attrName, callback) {
  let config
  if (type === 'attr') {
    config = {attributes: true}
  } else {
    config = {childList: true}
  }

  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === attrName) {
        callback()
        observer.disconnect()
      }
    })
  })
  observer.observe(el, config)
}

/**
 * convert a hexidecimal color string to rgb string
 * @param hex
 * @returns {string}
 */
function hexToRGB (hex) {
  let r = hex >> 16
  let g = hex >> 8 & 0xFF
  let b = hex & 0xFF
  return `rgb(${r}, ${g}, ${b})`
}