// utility function to create function with timeout, used in ga events
export function actWithTimeOut(callback: () => void, optTimeout?: number) {
  let called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, optTimeout ?? 1000);
  return fn;
}

/**
 * This function overrides the same function from upstream www/utils.js
 * Utility function to wait for DOM ready.
 * Executes the callback when the DOM is fully loaded.
 * @param {Function} callback
 */
export function onDomReady(callback: () => void) {
  document.addEventListener('turbolinks:load', callback);
}
