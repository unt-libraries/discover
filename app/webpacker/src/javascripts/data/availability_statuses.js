const statusDescData = {
  f: {
    label: 'AT OFFSITE PROCESSING',
    desc: 'The item is being processed off site and is not currently available. It cannot be requested.',
  },
  d: {
    label: 'DISCARDED',
    desc: 'The item is no longer part of our collection.',
  },
  e: {
    label: 'AT OFFSITE CATALOGING',
    desc: 'The item is being processed off site and is not currently available. It cannot be requested.',
  },
  '!': {
    label: 'ON HOLDSHELF',
    desc: 'Somebody requsted this item and it has been pulled for them. It is now waiting at the pickup location for the person who requested it to pick it up and check it out.',
  },
  b: {
    label: 'PAM BINDING',
    desc: 'The item is being processed and is not currently available.',
  },
  $: {
    label: 'LOST AND PAID',
    desc: 'A patron lost the item, and we are no longer looking for it. It cannot be requested.',
  },
  a: {
    label: 'TO BINDERY',
    desc: 'The item is being processed and is not currently available.',
  },
  '*': {
    label: 'DIGI PROJECTS',
    desc: 'The item is being used internally and is temporarily unavailable.',
  },
  n: {
    label: 'BILLED',
    desc: 'The item was checked out and never returned. The last person to have the item was sent a bill. The item cannot be requested.',
  },
  o: {
    label: 'LIB USE ONLY',
    desc: 'The item should be available on the shelf at the given location, but it can only be used in the library. It cannot be checked out or requested.',
  },
  m: {
    label: 'ON SEARCH',
    desc: 'The item has recently been reported lost or missing and we\'re actively looking for it.',
  },
  j: {
    label: 'LOST',
    desc: 'A patron lost the item, and we are no longer looking for it. It cannot be requested.',
  },
  k: {
    label: 'ON ORDER',
    desc: 'A new item has been ordered but has not yet been received by the library.',
  },
  h: {
    label: 'BINDERY PREP',
    desc: 'The item is being processed and is not currently available.',
  },
  '-': {
    label: 'AVAILABLE',
    desc: 'The item is available for checkout. It should be on the shelf at the listed location; if you can\'t find it, please ask for help at a Service Desk.',
  },
  w: {
    label: 'ONLINE',
    desc: 'This item or copy is available online--look for the FIND IT button. You may need to be on campus or authenticate using your EUID to access it.',
  },
  t: {
    label: 'IN TRANSIT',
    desc: 'The item is currently being delivered to a different location, often as the result of a hold or request.',
  },
  p: {
    label: 'PRESERVATION',
    desc: 'The item is being processed and is not currently available.',
  },
  z: {
    label: 'CLMS RETD',
    desc: 'Short for "Claims Returned." The item was checked out, and the person claims to have returned it, but we cannot find it. It cannot be requested.',
  },
  y: {
    label: 'MISSING',
    desc: 'We cannot find the item, and we do not know what happened to it. We are no longer looking for it. It cannot be requested.',
  },
};

export {
  statusDescData,
};
