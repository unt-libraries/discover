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
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.add(className);
    } else {
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
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')  }(\\b|$)`, 'gi'), ' ');
    }
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
