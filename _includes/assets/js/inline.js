if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

/**
* LoadFont 0.0.2
* A font loader that leverages LocalStorage
* @author Adam Beres-Deak (@bdadam) & Kyle Foster (@hkfoster)
* @source https://github.com/bdadam/OptimizedWebfontLoading
* @license MIT
**/

// Catch-all LocalStorage availability check
var localStorageAvailable = function() {
  var testKey = 'test', storage = window.localStorage;
  try {
    storage.setItem( testKey, '1' );
    storage.removeItem( testKey );
    return true;
  } catch ( error ) {
    return false;
  }
};

// Public API function
var loadFont = function( fontName, fontUrl, onlyLoadFontOnSecondPageload ){

  // Many unsupported browsers should stop here
  var nua  = navigator.userAgent,
      pass = localStorageAvailable(),
      nope = !window.addEventListener || !pass || ( nua.match( /(Android (2|3|4.0|4.1|4.2|4.3))|(Opera (Mini|Mobi))/ ) && !nua.match( /Chrome/ ) );

  if ( nope ) return;

  // Set up LocalStorage
  var loSto = {};

  // Set up a proxy variable to help with LocalStorage
  try { loSto = localStorage || {}; }
  catch( ex ) {}

  var loStoPrefix    = 'x-font-' + fontName,
      loStoUrlKey    = loStoPrefix + 'url',
      loStoCssKey    = loStoPrefix + 'css',
      storedFontUrl  = loSto[ loStoUrlKey ],
      storedFontCss  = loSto[ loStoCssKey ],
      storedUrlMatch = storedFontUrl === fontUrl,
      styleElement   = document.createElement( 'style' );

  // Make <style> element & apply base64 encoded font data
  styleElement.rel  = 'stylesheet';
  document.head.appendChild( styleElement );

  // CSS in LocalStorage & loaded from one of the current URLs
  if ( storedFontCss && storedUrlMatch ) {

    styleElement.textContent = storedFontCss;

  // Data not present or loaded from an obsolete URL
  } else {

    // Fetch font data from the server
    var request = new XMLHttpRequest();
    
    request.open( 'GET', fontUrl );
    request.onload = function() {
      if ( request.status >= 200 && request.status < 400 ) {

        // Update LocalStorage with fresh data & apply
        loSto[ loStoUrlKey ] = fontUrl;
        loSto[ loStoCssKey ] = request.responseText;
        if ( !onlyLoadFontOnSecondPageload ) styleElement.textContent = request.responseText;
      }
    };
    request.send();
  }
};

// Init
loadFont( 'web-', '/styles/fonts.css' );

// const ready = ( fn ) => {
//   if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
//     fn();
//   } else {
//     document.addEventListener('DOMContentLoaded', fn);
//   }
// }

// ready(() => {
//   const logo = document.querySelector( '.logo' );

//   if ( logo ) {
//     setTimeout(() => { 
//       logo.addEventListener( 'mouseenter', takeoff, false );
//       logo.addEventListener( 'mouseleave', landing, false );
  
//       logo.addEventListener( 'focus', takeoff, false );
//       logo.addEventListener( 'blur', landing, false );
//     }, 500 );
//   }
// });

// const takeoff = ( event ) => {
//   const elem = event.target.tagName === 'SVG' ? event.target.parentNode : event.target;
//   if ( !elem.classList.contains( 'blast-off' ) ) elem.classList.add( 'blast-off' );
// };

// const landing = ( event ) => {
//   const elem = event.target.closest('.logo');
//   const rocket = elem.querySelector( '.rocket' );
  
//   rocket.addEventListener( 'animationend', () => {
//     setTimeout(() => { 
//       elem.classList.remove( 'blast-off' ); 
//     }, 500 );
//   });
// };

/**
 * Mobile Menu 0.0.4
 * Mobile navigation menu module
 * @author Kyle Foster (@hkfoster)
 * @license MIT (http://www.opensource.org/licenses/mit-license.php/)
 **/

// Public API function
var mobileMenu = function (selector, settings) {

  // Overridable defaults
  var defaults = {
      initWidth: '820px',
      openClass: 'menu-open',
      menuSelector: '.main-menu',
      menuToggle: '.menu-toggle'
    },

    // Scoped variables
    options = Object.assign({}, defaults, settings),
    element = document.querySelector(selector),
    widthQuery = window.matchMedia(`(max-width: ${options.initWidth})`),
    docBody = document.body,
    focusable,
    firstFocusable,
    lastFocusable;

  // Attach listeners
  if (element) {

    // Call listener function explicitly at run time
    queryHandler(widthQuery);

    // Attach listener function to listen in on state changes
    widthQuery.addListener(queryHandler);

  }

  function keyHandler(event) {
    event = event || window.event;

    if (!docBody.classList.contains(options.openClass)) return false;

    var tabKey = 9,
      escKey = 27;

    // Key code conditionals
    switch (event.keyCode) {

      // Tab
      case tabKey:
        if (focusable.length === 1) {
          event.preventDefault();
          break;
        }

        // Go back if shift is fired, tab backward
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }

          // Otherwise tab forward
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
        break;

        // Esc
      case escKey:
        docBody.classList.remove(options.openClass);
        allowFocus(options.menuSelector, false);
        break;

        // Default
      default:
        break;
    }
  }

  // Click handler function
  function clickHandler(event) {

    // Combine element selector with anchor links
    var toggleSelector = `${options.menuToggle}, .${options.openClass} ${selector} a[href^="#"]`;

    // Only run on menu button
    if (event.target.closest(toggleSelector)) {

      // Toggle body class
      docBody.classList.toggle(options.openClass);

      // Set up modal focus trap
      if (docBody.classList.contains(options.openClass)) {
        allowFocus(options.menuSelector, true);
        trapFocus();
      } else {
        allowFocus(options.menuSelector, false);
      }
    }
  }

  function allowFocus(selector, state) {
    const container = document.querySelector(selector);
    const focusable = container.querySelectorAll('button, [href], input, select, textarea');
    focusable.forEach(el => el.setAttribute('tabindex', state ? '' : '-1'));
    container.hidden = !state;
  }

  // Trap focus to currently open modal
  function trapFocus() {
    focusable = element.querySelectorAll('button, [href], input, select, textarea');
    firstFocusable = focusable[0];
    lastFocusable = focusable[focusable.length - 1];
  }

  // Media query handler function
  function queryHandler(condition) {

    // If media query matches
    if (condition.matches) {

      // Prevent focus on menu elements
      allowFocus(options.menuSelector, false);

      // Click function listener
      document.addEventListener('click', clickHandler, false);
      document.addEventListener('keydown', keyHandler, false);

    } else {

      // Allow focus on menu elements
      allowFocus(options.menuSelector, true);

      // Remove click listener
      document.removeEventListener('click', clickHandler, false);
      document.removeEventListener('keydown', keyHandler, false);

    }
  }

};

// mobileMenu('[role=banner]');

// The debounce function receives our function as a parameter
const debounce = (fn) => {

  // This holds the requestAnimationFrame reference, so we can cancel it if we wish
  let frame;

  // The debounce function returns a new function that can receive a variable number of arguments
  return (...params) => {
    
    // If the frame variable has been defined, clear it now, and queue for next frame
    if (frame) { 
      cancelAnimationFrame(frame);
    }

    // Queue our function call for the next frame
    frame = requestAnimationFrame(() => {
      
      // Call our function and pass any params we received
      fn(...params);
    });

  } 
};


// Reads out the scroll position and stores it in the data attribute
// so we can use it in our stylesheets
const storeScroll = () => {
  document.documentElement.dataset.scroll = window.scrollY;
}

// Listen for new scroll events, here we debounce our `storeScroll` function
document.addEventListener('scroll', debounce(storeScroll), { passive: true });

// Update scroll position for first time
storeScroll();