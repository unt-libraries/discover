/**
 * Tests if a class exists on the given element
 * @param {HTMLElement|Element} el
 * @param {string} className
 * @returns {boolean}
 */
export function elHasClass(el, className) {
  let hasClass;
  if (el.classList) {
    hasClass = el.classList.contains(className);
  } else {
    hasClass = new RegExp(`(^| )${className}( |$)`, 'gi').test(el.className);
  }
  return hasClass;
}

/**
 * Adds classes to the given element
 * @param {HTMLElement|Element} el
 * @param {...string} classNames
 */
export function elAddClass(el, ...classNames) {
  if (el === null) return;
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.add(className);
    } else {
      // eslint-disable-next-line no-param-reassign
      el.className += ` ${className}`;
    }
  });
}

/**
 * Removes classes from the given element
 * @param {HTMLElement|Element} el
 * @param {...string} classNames
 */
export function elRemoveClass(el, ...classNames) {
  if (el === null) return;
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      // eslint-disable-next-line no-param-reassign
      el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'), ' ');
    }
  });
}

/**
 * Toggle classes on a given element
 * @param {HTMLElement|Element} el
 * @param {...string} classNames
 */
export function elToggleClass(el, ...classNames) {
  classNames.forEach((className) => {
    el.classList.toggle(className);
  });
}

/**
 * Removes all child elements of the given node
 * @param {HTMLElement|Element} node
 */
export function removeAllChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

// utility function to create function with timeout, used in ga events
export function actWithTimeOut(callback, optTimeout) {
  let called = false;
  function fn() {
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, optTimeout || 1000);
  return fn;
}

// Safe IE-friendly way to remove an element
export function removeElement(element) {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}
