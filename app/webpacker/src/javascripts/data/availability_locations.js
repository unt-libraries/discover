/**
* Data structure for looking up information based on location codes
 * Object key is used for lookup and should match the `code` in the Sierra API
 * Keys with asterisks are used for fallback and merge into matching key/objects
 *
 * Example: When looking for `czmrf`, we also capture the closest matching wildcard, `czm*`. The
 * objects are then merged, with specificity taking precedence. If a property is absent from
 * `czmrf`, the value from `czm*` will be used. This allows us to inherit things like abbreviations
 * and urls, but means that a property must be present with an empty string value to effectively
 * omit it.
 *
 * *** Wildcard lookup only goes 1 deep ***
 * This means that if you have wildcards `s*` and `szz*`, location `szzm` will only inherit `szz*`
 *
 * Object values (name and abbr are required, the rest are optional, but will inherit if possible)
 * {
 *   name: 'Chilton Media Library', // Specific name for availability table
 *   abbr: 'Media', // Shorter name used in places like availability buttons
 *   linkText: 'Media Library Map', // Title attribute used on linked `name`
 *   url: '//library.unt.edu/assets/images/spaces/floor-maps/media.png', // href of `name`
 * }
*/

const locationData = {
  'czm*': {
    name: 'Chilton Media Library',
    abbr: 'Media',
    linkText: 'Media Library Directory',
    url: 'https://library.unt.edu/media/#directory',
    btnClass: 'media',
  },
  czmrf: {
    name: 'Chilton Media Reference',
  },
  czmrs: {
    name: 'Chilton Media Reserves',
  },
  czwww: {
    name: 'Media Online Resources', abbr: 'Media Online', linkText: '', url: '',
  },
  'd*': {
    name: 'UNT Dallas Campus',
    abbr: 'UNT Dallas',
    linkText: 'UNT Dallas Library',
    url: 'https://www.untdallas.edu/library',
  },
  dcare: {
    name: 'Dallas Campus Career Development',
  },
  dfic: {
    name: 'Dallas Campus Fiction',
  },
  djuv: {
    name: 'Dallas Campus Juvenile Collection',
  },
  dmed: {
    name: 'Dallas Campus Media',
  },
  dref: {
    name: 'Dallas Campus Reference',
  },
  dresv: {
    name: 'Dallas Campus Reserves',
  },
  'f*': {
    name: '', abbr: '', linkText: '', url: '',
  },
  fip: {
    name: 'Frisco Inspire Park',
    abbr: 'Frisco Inspire Park',
    linkText: 'Frisco Inspire Park Map',
    url: 'https://frisco.unt.edu/location/inspire-park#map',
  },
  frsco: {
    name: 'Frisco Hall Park',
    abbr: 'Frisco Hall Park',
    linkText: 'Frisco Hall Park',
    url: 'https://frisco.unt.edu/location/hall-park',
  },
  'fl*': {
    name: 'Frisco Landing Library',
    abbr: 'Frisco Landing',
    linkText: 'Frisco Landing',
    url: 'https://frisco.unt.edu/',
  },
  flrs: {
    name: 'Frisco Landing Library Reserves',
    abbr: 'Frisco Landing Reserves',
  },
  flmak: {
    name: 'Frisco Landing The Spark',
    abbr: 'The Spark @ Frisco',
    linkText: 'The Spark Guide',
    url: 'https://guides.library.unt.edu/c.php?g=421156&p=9378118',
  },
  flind: {
    name: 'Frisco Landing Spark Technology Desk',
  },
  gwww: {
    name: 'Govt Online Resources', abbr: ' Govt Online', linkText: '', url: '',
  },
  hscfw: {
    name: 'UNTHSC Fort Worth',
    abbr: 'UNT HSC FW',
    linkText: 'Gibson D. Lewis Health Science Library',
    url: 'http://library.hsc.unt.edu/content/visit-lewis-library"',
  },
  ill: {
    name: 'Willis 1FL ILL', abbr: 'Willis 1st', linkText: '', url: '',
  },
  'j*': {
    name: '', abbr: '', linkText: '', url: '',
  },
  jlf: {
    name: 'Joint Library Facility Remote Storage',
    abbr: 'JLF Storage',
    btnClass: 'remote-storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  'k*': {
    name: '', abbr: '', linkText: '', url: '',
  },
  'kmat*': {
    name: 'Matthews Hall 307 Lab',
    abbr: 'Matthews Hall',
  },
  kpeb: {
    name: 'Physical Education Building 220 Lab',
    abbr: 'Phys Ed Bldg',
  },
  kpacs: {
    name: 'Chilton Hall 255 Lab',
    abbr: 'Chilton Hall',
  },
  'law*': {
    name: 'Law Library',
    abbr: 'Law Library',
    linkText: 'UNT Law Library Information',
    url: 'https://lawschool.untdallas.edu/law-library',
  },
  lawcl: {
    name: 'Law Library Clinic',
  },
  lawh: {
    name: 'Law Library Historical',
  },
  lawrf: {
    name: 'Law Library Reference',
  },
  lawrs: {
    name: 'Law Library Reserves',
  },
  lawtx: {
    name: 'Law Library Texas Materials',
  },
  lawww: {
    name: 'Law Library Online Resources',
  },
  libr: {
    name: 'Library',
    abbr: 'Library',
    linkText: '',
    url: '',
  },
  lwww: {
    name: 'UNT Online Resources',
    abbr: 'Online',
    linkText: '',
    url: '',
  },
  mail: {
    name: 'Faculty Mail Delivery (Do Not Delete)',
    abbr: 'Mail',
  },
  mwww: {
    name: 'Music Online Resources',
    abbr: 'Music Online',
    linkText: '',
    url: '',
  },
  pwww: {
    name: 'Special Collections Online Resources',
    abbr: 'Special Collections Online',
    linkText: '',
    url: '',
  },
  'r*': {
    name: 'Discovery Park Library',
    abbr: 'DPL',
    linkText: 'Discovery Park Library Directory',
    url: 'https://library.unt.edu/discovery-park/#directory',
    btnClass: 'discovery-park',
  },
  rfbks: {
    name: 'Discovery Park Library Featured Books',
  },
  rmak: {
    name: 'The Spark @ Discovery Park',
    abbr: 'The Spark @ DP',
    linkText: 'The Spark @ Discovery Park Guide',
    url: 'https://guides.library.unt.edu/c.php?g=421156&p=7182130',
  },
  rst: {
    name: 'Discovery Park Library Storage',
    abbr: 'DPL Storage',
  },
  rzzpb: {
    name: 'Discovery Park Library',
  },
  rzzrf: {
    name: 'Discovery Park Library Reference',
  },
  rzzrs: {
    name: 'Discovery Park Library Reserves',
  },
  's*': {
    name: 'Sycamore Library',
    abbr: 'Sycamore',
    linkText: 'Sycamore Library Directory',
    url: 'https://library.unt.edu/sycamore/#directory"',
    btnClass: 'sycamore',
  },
  s1fdc: {
    name: 'Sycamore Library 1FL Display',
  },
  s1ndc: {
    name: 'Sycamore Library 1FL New Books',
  },
  scbg: {
    name: 'Sycamore Library CMC & Juvenile Oversized Books',
  },
  sckit: {
    name: 'Sycamore Library CMC Kits',
  },
  scmc: {
    name: 'Sycamore Library Curriculum Materials Collection',
  },
  sd: {
    name: 'Sycamore Library Government Documents',
  },
  sd1dc: {
    name: 'Sycamore Library 1FL Display',
  },
  sdai: {
    name: 'Sycamore Library Docs A&I',
  },
  sdbi: {
    name: 'Sycamore Library Docs Bib Center',
  },
  sdcd: {
    name: 'Sycamore Library Docs CD',
  },
  sdmc: {
    name: 'Sycamore Library Docs Microform',
  },
  sdmp: {
    name: 'Sycamore Library Docs Maps',
  },
  sdnb: {
    name: 'Sycamore Library Docs-NOBARCODE',
  },
  sdndc: {
    name: 'Sycamore Library Docs New Books',
  },
  sdov: {
    name: 'Sycamore Library Docs Oversize',
  },
  sdtx: {
    name: 'Sycamore Library TX Documents',
  },
  sdtov: {
    name: 'Sycamore Library TX Docs Oversize',
  },
  sdus: {
    name: 'Sycamore Library US Documents',
  },
  sdvf: {
    name: 'Sycamore Library Docs Vertical File',
  },
  sdzmr: {
    name: 'Sycamore Library Map Reserves',
  },
  sdzrf: {
    name: 'Sycamore Library Reference',
  },
  sdzrs: {
    name: 'Sycamore Library Docs Reserves',
  },
  sdzsd: {
    name: 'Sycamore Library Service Desk',
  },
  sfin: {
    name: 'Sycamore Library Funding Information Network',
  },
  sjbg: {
    name: 'Sycamore Library CMC & Juvenile Oversized Books',
  },
  sjuv: {
    name: 'Sycamore Library Juvenile Collection',
  },
  spe: {
    name: 'Sycamore Library Periodicals',
  },
  smls: {
    name: 'Sycamore Library Best Sellers',
  },
  spec: {
    name: 'Special ID',
    abbr: 'Special',
    linkText: '',
    url: '',
  },
  swr: {
    name: 'Sycamore Library Workroom',
  },
  szmp: {
    name: 'Sycamore Library Maps',
  },
  'szz*': {
    name: 'Sycamore Library',
    abbr: 'Sycamore',
    linkText: 'Sycamore Library Directory',
    url: 'https://library.unt.edu/sycamore/#directory',
    btnClass: 'sycamore',
  },
  szzov: {
    name: 'Sycamore Library Oversize Books',
  },
  szzrf: {
    name: 'Sycamore Library Reference',
  },
  szzrs: {
    name: 'Sycamore Library Reserves',
    abbr: 'Sycamore Reserves',
  },
  szzsd: {
    name: 'Sycamore Library Service Desk',
  },
  tamc: {
    name: 'Texas A and M Commerce',
    abbr: 'TAMC',
    linkText: '',
    url: '',
  },
  test: {
    name: 'Testing-do not use',
    abbr: '',
    linkText: '',
    url: '',
  },
  twu: {
    name: 'Texas Women\'s University',
    abbr: 'TWU',
    linkText: '',
    url: '',
  },
  txsha: {
    name: 'TexShare',
    abbr: 'TexShare',
    linkText: '',
    url: '',
  },
  unt: {
    name: 'University of North Texas',
    abbr: 'UNT',
    linkText: '',
    url: '',
  },
  w: {
    name: 'Willis Library',
    abbr: 'Willis',
    url: 'https://library.unt.edu/willis/',
    btnClass: 'willis',
  },
  'w1*': {
    name: 'Willis 1st Floor',
    abbr: 'Willis 1st',
    linkText: 'Willis Library 1st Floor Directory',
    url: 'https://library.unt.edu/willis/first-floor/#directory',
    btnClass: 'willis',
  },
  w1fdc: {
    name: 'Willis 1FL Featured Books',
  },
  w1grs: {
    name: 'Willis 1FL Library Services Desk',
  },
  w1gwt: {
    name: 'Willis 1st Floor',
  },
  w1ia: {
    name: 'Willis 1FL Forum',
  },
  w1idl: {
    name: 'Willis 1FL Tech Desk Longterm Laptops',
  },
  w1ind: {
    name: 'Willis 1FL Spark Technology Desk',
  },
  w1mak: {
    name: 'The Spark @ Willis Library',
    abbr: 'The Spark',
    linkText: 'The Spark Guide',
    url: 'https://guides.library.unt.edu/spark/overview',
  },
  w1mdc: {
    name: 'Willis 1FL Monthly Display',
  },
  w1mls: {
    name: 'Willis 2FL Best Sellers',
    abbr: 'Willis 2nd',
    linkText: 'Willis Library 2nd Floor Directory',
    url: 'https://library.unt.edu/willis/second-floor/#directory',
  },
  w1ndc: {
    name: 'Willis 1FL New Books',
  },
  w1upr: {
    name: 'Willis 1FL UNT Press',
    abbr: 'Willis UNT Press',
  },
  'w2*': {
    name: 'Willis 2nd Floor',
    abbr: 'Willis 2nd',
    linkText: 'Willis Library 2nd Floor Directory',
    url: 'https://library.unt.edu/willis/second-floor/#directory',
    btnClass: 'willis',
  },
  w2awt: {
    name: 'Willis 2nd Admin Office Work tool',
  },
  w2lan: {
    name: 'Willis 2nd Floor Lib TACO',
    abbr: 'Lib TACO',
  },
  'w3*': {
    name: 'Willis 3rd Floor',
    abbr: 'Willis 3rd',
    linkText: 'Willis Library 3rd Floor Directory',
    url: 'https://library.unt.edu/willis/third-floor/#directory',
    btnClass: 'willis',
  },
  w3big: {
    name: 'Willis 3FL Oversize',
  },
  w3dai: {
    name: 'Willis 3rd Floor',
  },
  w3grn: {
    name: 'Willis 3FL Graphic Novels',
  },
  w3lab: {
    name: 'Willis 3rd Floor Digital Lab',
  },
  w3per: {
    name: 'Willis 3FL Periodicals',
  },
  'w4*': {
    name: 'Willis 4th Floor',
    abbr: 'Willis 4th',
    linkText: 'Willis Library 4th Floor Directory',
    url: 'https://library.unt.edu/willis/fourth-floor/',
    btnClass: 'willis',
  },
  w433a: {
    name: 'Willis 4FL Music Room 433A',
  },
  w4422: {
    name: 'Willis 4th Floor Music Room 422',
  },
  w4438: {
    name: 'Willis 4th Floor Music Room 438',
  },
  w4fil: {
    name: 'Willis 4FL Music Microfilm',
  },
  w4lok: {
    name: 'Willis 4FL Lockers',
  },
  w4m: {
    name: 'Willis 4FL Music Library',
  },
  w4mai: {
    name: 'Willis 4FL Music A&I',
  },
  w4mau: {
    name: 'Willis 4FL Music Audio Coll',
  },
  w4mav: {
    name: 'Willis 4FL Music Audio Oversize',
  },
  w4mbg: {
    name: 'Willis 4FL Bragg Coll',
  },
  w4mfb: {
    name: 'Willis 4FL Music Fake Book',
  },
  w4mft: {
    name: 'Willis 4FL Music Featured Items',
  },
  w4mla: {
    name: 'Willis 4FL Music Limited Access',
  },
  w4moc: {
    name: 'Willis 4FL Music Ozier Coll',
  },
  w4mov: {
    name: 'Willis 4FL Music Oversize',
  },
  w4mr1: {
    name: 'Willis 4th Floor Music Sandborn Miniature',
  },
  w4mr2: {
    name: 'Willis 4FL Music Sandborn Oversize',
  },
  w4mr3: {
    name: 'Willis 4FL Music Sandborn Reading Room',
  },
  w4mrb: {
    name: 'Willis 4FL Music Sandborn Coll',
  },
  w4mrf: {
    name: 'Willis 4FL Music Reference',
  },
  w4mrs: {
    name: 'Willis 4FL Music Reserves',
  },
  w4mrx: {
    name: 'Willis 4FL Music Sandborn Brittle',
  },
  w4mts: {
    name: 'Willis 4FL Music Technical Services',
  },
  w4mwf: {
    name: 'Willis 4th Floor Music WFAA Collection',
  },
  w4mwr: {
    name: 'Willis 4th Floor Music Workroom',
  },
  w4spc: {
    name: 'Willis 4FL Special Collections',
  },
  w4spe: {
    name: 'Willis 4FL Special Collections',
  },
  w4srf: {
    name: 'Willis 4FL Special Collections Reference',
  },
  'wex*': {
    name: 'Willis Exhibition',
    abbr: 'Willis Exhibition',
    linkText: 'Willis Library 1st Floor Directory',
    url: 'https://library.unt.edu/willis/first-floor/#directory',
    btnClass: 'willis',
  },
  wgrc: {
    name: 'Willis Graduate Reserve',
    abbr: 'Willis Grad Reserve',
    linkText: '',
    url: '',
    btnClass: 'willis',
  },
  'wl*': {
    name: 'Willis Lower Level',
    abbr: 'Willis LL',
    linkText: 'Willis Library Lower Level Floor Directory',
    url: 'https://library.unt.edu/willis/lower-level/#directory',
    btnClass: 'willis',
  },
  wlbig: {
    name: 'Willis LL Oversize',
  },
  wllok: {
    name: 'Willis LL Lockers',
  },
  wlmic: {
    name: 'Willis LL Microforms',
  },
  'x*': {
    name: 'Remote Storage',
    abbr: 'Remote Storage',
    linkText: '',
    url: '',
    btnClass: 'remote-storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xcmc: {
    name: 'Curriculum Materials Collection Remote Storage',
    abbr: 'Curriculum Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xdmic: {
    name: 'Government Documents Remote Storage Microforms',
    abbr: 'Gov Docs Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xdmp: {
    name: 'Government Documents Remote Storage Maps',
    abbr: 'Gov Docs Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xdoc: {
    name: 'Government Documents Remote Storage',
    abbr: 'Gov Docs Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xjuv: {
    name: 'Juvenile Collection Remote Storage',
    abbr: 'Juvenile Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xmau: {
    name: 'Music Audio Coll Remote Storage',
    abbr: 'Music Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xmed: {
    name: 'Media Remote Storage',
    abbr: 'Media Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xmic: {
    name: 'Remote Storage Microforms',
    abbr: 'Storage Microforms',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xmus: {
    name: 'Music Remote Storage',
    abbr: 'Music Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xprsv: {
    name: 'Preservation Lab',
    abbr: 'Preservation Lab',
  },
  xspc: {
    name: 'Special Collections Remote Storage',
    abbr: 'Special Collections Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xspe: {
    name: 'Special Collections Remote Storage',
    abbr: 'Special Collections Storage',
    statusText: 'This item is located off campus and will take time for processing and delivery.',
  },
  xts: {
    name: 'Collection Management Work Room',
    abbr: 'Collection Management',
  },
  zzzzz: {
    name: 'Error',
    abbr: '',
    linkText: '',
    url: '',
  },
};

export {
  // eslint-disable-next-line import/prefer-default-export
  locationData,
};
