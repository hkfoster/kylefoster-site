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