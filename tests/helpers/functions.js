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