# Supported Browsers

This library, for the time being, is using Array.isArray without a polyfill. Accoring to [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray), these are the earliset browsers that support Array.isArray:

* Desktop
  * Chrome 5
  * Firefox (Gecko) 4.0 (2.0)
  * Internet Explorer 9
  * Opera 10.5
  * Safari 5
* Mobile
  * Android (yes)
  * Chrome for Android (yes)
  * Firefox Mobile (Gecko) 4.0 (2.0)
  * IE Mobile (yes)
  * Opera Mobile (yes)
  * Safari Mobile (yes)

I would really like to avoid supporting browsers older than this so unless this project somehow grows in popularity (currently 0 people use this), the list above represents the list of oldest supported browsers. Browsers older than the browsers listed above will not function correctly when running treetests.
