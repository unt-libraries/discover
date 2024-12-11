import { OffCanvasSearch } from './search.offcanvas.js';
import { DropdownManager } from './display.dropdowns.js';
import { LibraryHours } from './display.hours.js';
import { EventManager } from './display.events.js';
import { BootstrapOptIns } from './utils.bootstrap.js';
import { AnchorUtility } from './display.anchors.js';
import { ModalMapHandler } from './modal.map.js';
import { HighlightSearchTermMatch } from './search.highlight.js';
import { IdentifierHelper } from './search.identifiers.js';
import { ChatManager } from './display.chat.js';
import { DisplayBasics } from './display.basics.js';


const untlBase = "https://demo.library.unt.edu"
const dataSrc = "https://demo.library.unt.edu/assets/omni/data/dropdowns.json"
const offCanvasSearchUtil = new OffCanvasSearch();
const dropdownManager = new DropdownManager({
  baseURL: untlBase,
  dataSrc: dataSrc,
});
const libraryHours = new LibraryHours(dropdownManager);
const eventManager = new EventManager();
const anchorUtility = new AnchorUtility();
const identifierHelper = new IdentifierHelper();
const modalMapHandler = new ModalMapHandler();
const highlightSearchTermMatch = new HighlightSearchTermMatch();
const chatManager = new ChatManager();
const bsOptIns = new BootstrapOptIns();
const displayBasics = new DisplayBasics();
