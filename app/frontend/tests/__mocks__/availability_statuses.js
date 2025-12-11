const statusDescData = {
  a: {
    label: 'To Bindery',
    desc: 'The item is being processed and is not currently available.',
    btnClass: 'unavailable',
  },
  b: {
    label: 'Pam Binding',
    desc: 'The item is being processed and is not currently available.',
    btnClass: 'unavailable',
  },
  d: {
    label: 'Discarded',
    desc: 'The item is no longer part of our collection.',
    btnClass: 'unavailable',
  },
  e: {
    label: 'At Offsite Cataloging',
    desc: 'The item is being processed off site and is not currently available. It cannot be requested.',
    btnClass: 'unavailable',
  },
  f: {
    label: 'At Offsite Processing',
    desc: 'The item is being processed off site and is not currently available. It cannot be requested.',
    btnClass: 'unavailable',
  },
  g: {
    label: 'Music Processing',
    desc: 'The music library is currently processing this item.',
    btnClass: 'unavailable',
  },
  h: {
    label: 'Bindery Prep',
    desc: 'The item is being processed and is not currently available.',
    btnClass: 'unavailable',
  },
  i: {
    label: 'Media Processing',
    desc: 'The media library is currently processing this item.',
    btnClass: 'unavailable',
  },
  j: {
    label: 'Lost',
    desc: 'A patron lost the item, and we are no longer looking for it. It cannot be requested.',
    btnClass: 'unavailable',
  },
  k: {
    label: 'On Order',
    desc: 'A new item has been ordered but has not yet been received by the library.',
    btnClass: 'unavailable',
  },
  m: {
    label: 'On Search',
    desc: 'The item has recently been reported lost or missing and we\'re actively looking for it.',
    btnClass: 'unavailable',
  },
  n: {
    label: 'Billed',
    desc: 'The item was checked out and never returned. The last person to have the item was sent a bill. The item '
        + 'cannot be requested.',
    btnClass: 'unavailable',
  },
  o: {
    label: 'Library Use Only',
    desc: 'The item should be available on the shelf at the given location, but it can only be used in the library. It '
        + 'cannot be checked out or requested.',
    btnClass: 'unavailable',
  },
  p: {
    label: 'Preservation',
    desc: 'The item is being processed and is not currently available.',
    btnClass: 'unavailable',
  },
  r: {
    label: 'Requestable',
    desc: 'The item can be requested.',
    btnClass: 'available',
  },
  t: {
    label: 'In Transit',
    desc: 'Item is being moved between locations because it\'s new or because of a request.',
    btnClass: 'unavailable',
  },
  w: {
    label: 'Linked above',
    desc: 'This item or copy is available online--look for the FIND IT button. You may need to be on campus or '
      + 'authenticate using your EUID to access it.',
    btnClass: 'online',
  },
  x: {
    label: 'In Transit Too Long',
    desc: 'The item has been IN TRANSIT for longer than five days. It may have been lost, or it '
      + 'may have not been checked in properly when it arrived at its destination.',
    btnClass: 'unavailable',
  },
  y: {
    label: 'Missing',
    desc: 'We cannot find the item, and we do not know what happened to it. We are no longer looking for it. '
      + 'It cannot be requested.',
    btnClass: 'unavailable',
  },
  z: {
    label: 'Claims Returned',
    desc: 'The item was checked out, and the person claims to have returned it, but we cannot find it. It cannot be '
        + 'requested.',
    btnClass: 'unavailable',
  },
  '-': {
    label: 'Available',
    desc: 'The item is available for checkout. It should be on the shelf at the listed location; if you can\'t find '
      + 'it, please ask for help at a Services Desk.',
    btnClass: 'available',
  },
  '!': {
    label: 'On Holdshelf',
    desc: 'Somebody requested this item and it has been pulled for them. It is now waiting at the pickup location for '
      + 'the person who requested it to pick it up and check it out.',
    btnClass: 'unavailable',
  },
  $: {
    label: 'Lost and Paid',
    desc: 'A patron lost the item, and we are no longer looking for it. It cannot be requested.',
    btnClass: 'unavailable',
  },
  '*': {
    label: 'Digi Projects',
    desc: 'The item is being used internally and is temporarily unavailable.',
    btnClass: 'unavailable',
  },
};

export {
  // eslint-disable-next-line import/prefer-default-export
  statusDescData,
};
