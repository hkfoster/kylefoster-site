// Utils

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

if ('fonts' in document) {
  const ttcBook = new FontFace('TT Commons', 'url(/static/fonts/tt-commons-book.woff2) format("woff2")', { weight: '400' });
  const ttcBold = new FontFace('TT Commons', 'url(/static/fonts/tt-commons-bold.woff2) format("woff2")', { weight: '700' });
  const tosBold = new FontFace('Ten Oldstyle', 'url(/static/fonts/ten-oldstyle-bold.woff2) format("woff2")', { weight: '700' });
  const iawBook = new FontFace('iA Writer Duospace', 'url(/static/fonts/ia-writer-duospace-book.woff2) format("woff2")', { weight: '400' });

  Promise.all([ 
    ttcBook.load(), 
    ttcBold.load(), 
    tosBold.load(), 
    iawBook.load() 
  ]).then(function(fonts) {
    fonts.forEach(function(font) {
      document.fonts.add(font);
    });
  });
}

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

  const images = document.querySelectorAll('[data-src]')

  function load(img) {
    img.setAttribute('src', img.getAttribute('data-src'))
    img.setAttribute('srcset', img.getAttribute('data-srcset'))
    
    // Pause for 1/10th second to render correctly
    setTimeout(function() {
      img.removeAttribute('data-src')
      img.removeAttribute('data-srcset')
    }, 100)
  }
  
  images.forEach(function(img) {
    if (img.complete) {
      load(img)
    } else {
      img.addEventListener('load', function(event) {
        load(event.target)
      })
      img.addEventListener('error', function() {
        console.log('Image loading error')
      })
    }
  })  

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
})