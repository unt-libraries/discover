// IE8+ compatible test for class on element
export function elHasClass(el, className) {
  let hasClass;
  if (el.classList) {
    hasClass = el.classList.contains(className);
  } else {
    hasClass = new RegExp(`(^| )${className}( |$)`, 'gi').test(el.className);
  }
  return hasClass;
}

// IE8+ compatible add class to element
export function elAddClass(el, ...classNames) {
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ` ${className}`;
    }
  });
}

// IE8+ compatible add class to element
export function elRemoveClass(el, ...classNames) {
  classNames.forEach((className) => {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')  }(\\b|$)`, 'gi'), ' ');
    }
  });
}
