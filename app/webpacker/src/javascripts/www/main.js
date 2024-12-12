// Changes from source noted below with "EDITED"
import { OffCanvasSearch } from './search.offcanvas.js';
import { DropdownManager } from './display.dropdowns.js';
import { LibraryHours } from './display.hours.js';
import { EventManager } from './display.events.js';
import { AnchorUtility } from './display.anchors.js';
import { ModalMapHandler } from './modal.map.js';
import { HighlightSearchTermMatch } from './search.highlight.js';
import { IdentifierHelper } from './search.identifiers.js';
// import { ShortcutManager } from './home.shortcuts.js'; // EDITED to remove home.shortcuts.js
import { ChatManager } from './display.chat.js';
import { DisplayBasics } from './display.basics.js';
// import { DidYouKnowRenderer } from './display.dyk.js'; // EDITED to remove display.dyk.js
import { optInTooltips, optInPopovers } from './utils.js'; // EDITED to not import onDomReady
import { onDomReady } from '../_utils.ts'; // EDITED to override onDomReady function

const untlBase = "https://demo.library.unt.edu" // EDITED to change base URL
const dataSrc = "https://demo.library.unt.edu/assets/omni/data/dropdowns.json" // EDITED to change data source URL

// Initialize tooltips and popovers if needed
onDomReady(() => {
  optInTooltips();
  optInPopovers();
});

const offCanvasSearchUtil = new OffCanvasSearch();
const dropdownManager = new DropdownManager({ // EDITED to change base URL and data source URL
  baseURL: untlBase,
  dataSrc: dataSrc,
});
const libraryHours = new LibraryHours(dropdownManager);
const eventManager = new EventManager();
const anchorUtility = new AnchorUtility();
const identifierHelper = new IdentifierHelper();
const modalMapHandler = new ModalMapHandler();
const highlightSearchTermMatch = new HighlightSearchTermMatch();
// const shortcutManager = new ShortcutManager('#shortcuts', '.shortcuts-toggle', 4); // EDITED to remove home.shortcuts.js
const chatManager = new ChatManager();
const displayBasics = new DisplayBasics();
// const displayDyk = new DidYouKnowRenderer() // EDITED to remove display.dyk.js
