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

import { InsertToTopButtons } from './display.to-top.js';

import { optInTooltips, optInPopovers } from './utils.js'; // EDITED to not import onDomReady
import { onDomReady } from '../_utils.ts'; // EDITED to override onDomReady function

// Initialize tooltips and popovers if needed
onDomReady(() => {
  optInTooltips();
  optInPopovers();
});

// Override dropdown configuration if it is set in the global window object
const dropdownConfig = window.untLib?.dropdownConfig || {};

const insertToTopButtons = new InsertToTopButtons();
const offCanvasSearchUtil = new OffCanvasSearch();
const dropdownManager = new DropdownManager(dropdownConfig); // EDITED to use config on window object
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
