/**
 * This function run callback after DOM event on target element
 * @param type - attribute or element
 * @param el - target element
 * @param {String} attrName - target attribute
 * @param callback
 */
function observe (type, el, attrName, callback) {
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
/**
 * @param {string} path
 * @returns {string}
 */
function getPathStartPoint (path) {
  let commands = path.match(/[^\d\.,e-]/ig)
  return path.slice(1, path.indexOf(commands[1]))
}
/**
 * @param {string} path
 * @returns {string}
 */
function getPathEndPoint (path) {
  let commands = path.match(/[^\d\.,e-]/ig)
  if (commands[commands.length - 1] === 'Z') {
    let beforeLastCommaIndex = path.lastIndexOf(',', path.lastIndexOf(',') - 1)
    return path.slice(beforeLastCommaIndex + 1, -1)
  } else if (commands[commands.length - 1] === 'C') {
    let beforeLastCommaIndex = path.lastIndexOf(',', path.lastIndexOf(',') - 1)
    return path.slice(beforeLastCommaIndex + 1)
  } else { // last command L
    return path.slice(path.lastIndexOf(commands[commands.length - 1]) + 1)
  }
}
