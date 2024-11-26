import { DropdownManager } from './dropdowns.js';
import { LibraryHours } from './hours';
import { EventManager } from './todays-events.js';
import { bootstrapOptIns } from './utils.bootstrap.js';
import { AnchorUtility } from './anchors.js';
import { ModalMapHandler } from './modal.map.js';
import { Highlight } from './highlight.js';

const dropdownManager = new DropdownManager();
const libraryHours = new LibraryHours(dropdownManager);
const eventManager = new EventManager();
const anchorUtility = new AnchorUtility();
const modalMapHandler = new ModalMapHandler();
const highlight = new Highlight();

// Initialize Bootstrap tooltips and popovers
bootstrapOptIns();
