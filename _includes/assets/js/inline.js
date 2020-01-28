// Utils

/**
 * Throttle 0.0.1
 * Event throttle function
 * @author Kyle Foster (@hkfoster)
 * @reference http://www.html5rocks.com/en/tutorials/speed/animations/
 * @license MIT
 **/

// Public API function
var throttle = function ( type, name, obj ) {
  obj = obj || window;
  var running = false;
  var func = function () {
    if ( running ) { return; }
    running = true;
    requestAnimationFrame( function () {
      obj.dispatchEvent( new CustomEvent( name ) );
      running = false;
    });
  };
  obj.addEventListener( type, func );
};

/**
 * Timeout 0.0.1
 * Just like setTimeout & clearTimeout, but with requestAnimationFrame()
 * @author Joe Lambert (@joelambert) & Kyle Foster (@hkfoster)
 * @source https://gist.github.com/joelambert/1002116#file-requesttimeout-js
 * @license MIT
 **/

// Public API object
var timeout = {

  // Set timeout function
  set : function( fn, delay, args ) {

    var start  = Date.now(),
        handle = {};

    function loop() {

      var current = Date.now(),
          delta   = current - start;

      if ( delta >= delay ) {
        if ( args !== undefined ) {
          fn.call( fn, args );
        } else {
          fn.call( fn );
        }
      } else {
        handle.value = requestAnimationFrame( loop );
      }
    }

    handle.value = requestAnimationFrame( loop );
    return handle;
  },

  // Clear timeout function
  clear : function( handle ) {
    window.cancelAnimationFrame( handle.value );
  }
};

// Implementation

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

/**
 * FullStop 0.0.3
 * Prevent CSS transitions from occurring during a window resize
 * @author Kyle Foster (@hkfoster)
 * @license MIT
 **/

// Public API function
var fullStop = function (settings) {

  // Overridable defaults
  var defaults = {
    resizeDelay: 250,
  };

  // Scoped variables
  var options = Object.assign({}, defaults, settings),
      resizeTimer;

  // Resize handler function
  function resizeHandler() {

    // Clear timer (if it exists)
    if (resizeTimer) timeout.clear(resizeTimer);

    // Add style element while resizing
    if (!document.querySelector('#full-stop')) {
      document.body.insertAdjacentHTML(
        'beforeend',
        `<style id="full-stop">
          *, 
          *:after, 
          *:before { 
            transition: none !important; 
            animation: none !important; 
          }
        </style>`
      );
    }

    // Check to see if resize is over
    resizeTimer = timeout.set(function () {

      // And style element upon completion
      document.body.removeChild(document.querySelector('#full-stop'))

      // Delay firing function based on argument passed
    }, options.resizeDelay);

  }

  // Resize throttle function init
  throttle('resize', 'optimizedResize');

  // Resize function listener
  window.addEventListener('optimizedResize', resizeHandler, false);

};

const ready = ( fn ) => {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(() => {
  // This is pretty annoying
  document.documentElement.focus();

  fullStop();

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