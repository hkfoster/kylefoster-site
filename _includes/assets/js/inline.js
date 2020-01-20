/**
 * LoadFont 0.0.3
 * A font loader that leverages LocalStorage
 * @author Adam Beres-Deak (@bdadam) & Kyle Foster (@hkfoster)
 * @source https://github.com/bdadam/OptimizedWebfontLoading
 * @license MIT
 **/

// Catch-all LocalStorage availability check
var localStorageAvailable = ( function( win ) {
  var testKey = 'test', storage = win.localStorage
  try {
    storage.setItem( testKey, '1' )
    storage.removeItem( testKey )
    return true
  } catch ( error ) {
    return false
  }
})( window )

// Public API function
var loadFont = function( fontName, fontFaceUrl, onlyLoadFontOnSecondPageload ){

  // Many unsupported browsers should stop here
  if ( !localStorageAvailable ) return

  // Set up LocalStorage
  var loSto = {}

  // Set up a proxy variable to help with LocalStorage
  try { loSto = localStorage || {} }
  catch( ex ) {}

  var loStoPrefix    = 'x-font-' + fontName,
      loStoUrlKey    = loStoPrefix + 'url',
      loStoCssKey    = loStoPrefix + 'css',
      storedFontUrl  = loSto[ loStoUrlKey ],
      storedFontCss  = loSto[ loStoCssKey ],
      storedUrlMatch = storedFontUrl === fontFaceUrl,
      styleElement   = document.createElement( 'style' )

  // Make <style> element & apply base64 encoded font data
  styleElement.rel  = 'stylesheet'
  document.head.appendChild( styleElement )

  // CSS in LocalStorage & loaded from one of the current URLs
  if ( storedFontCss && storedUrlMatch ) {

    styleElement.textContent = storedFontCss

  // Data not present or loaded from an obsolete URL
  } else {

    // Fetch font data from the server
    var request = new XMLHttpRequest()
    request.open( 'GET', fontFaceUrl )
    request.onload = function() {
      if ( request.status >= 200 && request.status < 400 ) {

        // Update LocalStorage with fresh data & apply
        loSto[ loStoUrlKey ] = fontFaceUrl
        loSto[ loStoCssKey ] = request.responseText
        if ( !onlyLoadFontOnSecondPageload ) styleElement.textContent = request.responseText
      }
    }
    request.send()
  }
}

// Init
loadFont('web-', '/styles/fonts.css')

const ready = ( fn ) => {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(() => {
  const menuButton = document.querySelector('.menu-button')

  menuButton.addEventListener('mousedown', toggleMenu)

  menuButton.addEventListener('keyup', event => {
    if (event.keyCode === 13 || event.keyCode === 32) { toggleMenu() }
  })

  function toggleMenu(event) {
    const body = document.body

    if (!document.body.classList.contains('menu-open')) {
      const scrollPosition = document.documentElement.style.getPropertyValue('--scroll')
      body.classList.add('menu-open')
      body.style.position = 'fixed'
      body.style.top = `-${scrollPosition}`
    }

    else {
      const scrollPosition = body.style.top
      body.style.position = ''
      body.style.top = ''
      window.scrollTo(0, parseInt(scrollPosition || '0') * -1)
      body.classList.remove('menu-open')
    }
    
    if (event) event.preventDefault()
  }
  
  window.addEventListener('scroll', () => {
    document.documentElement.style.setProperty('--scroll', `${window.scrollPosition}px`)
  })
})