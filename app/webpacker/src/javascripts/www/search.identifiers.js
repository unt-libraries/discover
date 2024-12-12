import { onDomReady } from './utils.js';

export class IdentifierHelper {
  constructor() {
    this.doiRegex = /10.\d{4,9}\/[-._;()\/:A-Z0-9]+/ig;
    this.urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    this.proxyUrl = 'https://libproxy.library.unt.edu:443/login?url=';
    this.urls = {
      ill: 'https://library.unt.edu/services/ill-document-delivery/',
      proxyTools: 'https://library.unt.edu/proxy-tools',
    };
    this.proxyString = (queryString, prxyTyp) => {
      const doiPrefix = prxyTyp === 'doi' ? 'https://doi.org/' : '';
      return `${this.proxyUrl}${doiPrefix}${queryString}`;
    };
    this.openDOIString = (doi) => {
      return `https://unpaywall.org/${doi}`;
    };
    this.summonDOIString = (doi) => {
      return `https://untexas.summon.serialssolutions.com/search#!/search?ho=f&l=en&q=(DOI:(${doi}))`;
    };
    this.illiadURLString = (queryString, prxyTyp) => {
      if (prxyTyp === 'url') {
        queryString = encodeURIComponent(queryString);
      }
      const queryArgs = prxyTyp === 'doi' ? `&doi=${queryString}` : `&notes=${queryString}`;
      return `https://ill.library.unt.edu/illiad/illiad.dll?Action=10&Form=22${queryArgs}`;
    };
    this.selectors = {
      doiInputs: document.querySelectorAll("input.proxyable-target"),
      doiText: document.querySelector('#proxyable-string'),
    };
    this.strings = {
      doi: {
        tooltip: 'DOI found. See options.',
        header: 'Accessing Items with a Digital Object Identifier (DOI)',
        label: 'We think your search contains a DOI:',
        instructions: 'Try these first:',
        note: 'Note: you may be directed to a login prompt first.',
        ifPaywall: 'If you hit a paywall:',
        endMsg: '*DOI not valid? Look for spaces, trailing punctuation, and/or check your source.',
        directAccess: '1. Direct Access',
        doiOpenAccess: '2. Find Open Access Copy',
        summon: `3. Try this search, then look for the buttons <strong>"Find It"</strong> or
                 <strong>"Check More Sources"</strong> on the results
                 page, and follow those links.`,
        illiad: '4. Submit an Interlibrary Loan request.',
        illiadNote: `Items not found in a subscription services can
               typically be requested and delivered to you.`,
        externalLinkText: 'opens in a new tab',
      },
      url: {
        tooltip: 'URL found. See options.',
        header: 'Getting Access to Paywalled Content',
        label: 'Your search contains a URL:',
        instructions: `Never pay for articles! The library
                       can usually get them to you for free.*`,
        note: `You will be routed through a library
               login prompt. If we subscribe to the source, you should
               have instant access. Note: If we don't subscribe to the source,
               you'll hit a white screen and will need to try a different option.`,
        ifPaywall: null,
        endMsg: '*Current Students, Faculty, & Staff.',
        directAccess: `1. Try to "Proxify" the URL. `,
        doiOpenAccess: 'Find Open Access Copy',
        summon: null,
        illiad: '2. Submit an Interlibrary Loan request.',
        illiadNote: `Items not found in a subscription services can
                     typically be requested and delivered to you. You will
                     need to provide publication details on the request form.`,
        externalLinkText: 'opens in a new tab',
      },
    }
    // autorun
    onDomReady(() => {
      this.init();
    });
  }
  buildModal(prxyStr, prxyTyp) {
    const existingModal = document.querySelector('#proxyable-modal');
    if (existingModal) {
      this.destroyModal(existingModal);
    }
    const strings = prxyTyp === 'doi' ? this.strings.doi : this.strings.url;
    const classes = {
      listGroupItems: ["list-group-item", "list-group-item-action", "link-success"],
      listGroupItemFlex: ["d-flex", "justify-content-between", "align-items-center"],
      externalLink: ["far", "fa-external-link"],
      listGroupItemBold: ["list-group-item", "fw-bold"],
    };
    const search = () => {
      return `<div class="list-group-item">
                <div class="form-floating mb-3">
                 <input class="form-control fw-bolder"
                     id="proxyable-string"
                     value="${ prxyStr }" />
                 <label class="fw-light"
                     for="proxyable-string">
                  ${ strings.label }
                 </label>
                </div>
              </div>`;
    };
    const instruct = () => {
      return `<div class="${ classes.listGroupItemBold.join(' ') }">
            ${ strings.instructions }
          </div>`;
    };
    const directAccess = () => {
      return `<a id="proxyable-direct-access"
                 target="_blank"
                 class="${ classes.listGroupItems.join(' ') }"
                 href="${ this.proxyString(prxyStr, prxyTyp) } ">
               <div class="${ classes.listGroupItemFlex.join(' ') } pb-1">
                ${ strings.directAccess }
                <span class="${ classes.externalLink.join(' ') }"
                   title="${ strings.externalLinkText }"></span>
               </div>
               <div class="small fst-italic text-secondary">
                ${ strings.note }
               </div>
              </a>`;
    };
    const doiOpenAccess = () => {
      return `<a id="doi-open-access"
                 target="_blank"
                 class="${ classes.listGroupItems.join(' ') } ${ classes.listGroupItemFlex.join(' ') }"
                 href="${ this.openDOIString(prxyStr) }">
                ${ strings.doiOpenAccess }
                <span class="${ classes.externalLink.join(' ') }"
                   title="${ strings.externalLinkText }"></span>
              </a>`;
    };
    const summonFallback = () => {
      return `<a id="doi-summon-access"
                 target="_blank"
                 class="${ classes.listGroupItems.join(' ') } ${ classes.listGroupItemFlex.join(' ') }"
                 href="${ this.summonDOIString(prxyStr) }">
                <span>${ strings.summon }</span>
                <span class="${ classes.externalLink.join(' ') }"
                   title="${ strings.externalLinkText }"></span>
              </a>`;
    };
    const illiadFallback = () => {
      return `<a id="proxyable-illiad-access"
                 target="_blank"
                 class="${ classes.listGroupItems.join(' ') }"
                 href="${ this.illiadURLString(prxyStr, prxyTyp) }">
                <div class="${ classes.listGroupItemFlex.join(' ') } pb-1">
                  <span>${ strings.illiad }</span>
                  <span class="${ classes.externalLink.join(' ') }"
                     title="${ strings.externalLinkText }"></span>
                </div>
                <div class="small fst-italic text-secondary">
                  ${ strings.illiadNote }
                </div>
              </a>`;
    };
    const learnMore = () => {
      return `<div class="list-group-item ${ classes.listGroupItemFlex.join(' ') } pb-1">
                <span>
                 For additional help see:
                 <a class="link-success"
                  target="_blank"
                  href="${this.urls.ill}">
                  Interlibrary Loan</a>,
                 <a class="link-success"
                  target="_blank"
                  href="${this.urls.proxyTools}">Proxy Tools</a>.
                </span>
              </div>`;
    };
    const ifPaywall = () => {
      return `<div class="${ classes.listGroupItemBold.join(' ') }">
                ${ strings.ifPaywall }
              </div>`;
    };
    const endMsg = () => {
      return `<div class="list-group-item font-italic">
                ${ strings.endMsg }
              </div>`;
    };
    const makeBody = () => {
      const isDoi = prxyTyp === 'doi';
      return `<div class="modal-body">
                <div class="list-group list-group-flush">
                  ${search()}
                  ${instruct()}
                  ${directAccess()}
                  ${isDoi ? doiOpenAccess() : '' }
                  ${isDoi ? ifPaywall() : '' }
                  ${isDoi ? summonFallback() : '' }
                  ${illiadFallback()}
                  ${learnMore()}
                  ${endMsg()}
                </div>
              </div>`;
    };
    const makeHeader = () => {
      return `<div class="modal-header">
                <h5 class="modal-title">
                 ${ strings.header }
                </h5>
                <button type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"></button>
              </div>`;
    };
    const makeDialogEl = () => {
      return `<div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                  ${ makeHeader() }
                  ${ makeBody() }
                </div>
              </div>`;
    };
    const makeModal = () => {
      const body = document.querySelector('body');
      const fragement = document.createDocumentFragment();
      const modalEl = document.createElement('div');
      modalEl.classList.add('modal', 'fade');
      modalEl.setAttribute('id', 'proxyable-modal');
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML = makeDialogEl();
      fragement.appendChild(modalEl);
      body.appendChild(fragement);
      return modalEl;
    };
    return makeModal();
  }

  init() {
    // exit early if no doiInputs
    if (this.selectors.doiInputs.length === 0) {
      return;
    }
    this.selectors.doiInputs.forEach((input) => {
      input.addEventListener("paste", (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData("text");
        this.handlePaste(pasted, input);
      });
    });
  }

  initializeModalEventListeners(modalEl, prxyStr, prxyTyp) {
    const modalInput = modalEl.querySelector('#proxyable-string');
    const proxyableDirectAccess = modalEl.querySelector("#proxyable-direct-access");
    const doiOpenAccess = modalEl.querySelector("#doi-open-access");
    const doiSummonAccess = modalEl.querySelector("#doi-summon-access");
    const itemIlliadAccess = modalEl.querySelector("#proxyable-illiad-access");
    modalEl.addEventListener('hidden.bs.modal', () => {
      this.destroyModal(modalEl);
      const initiatedItem = document.querySelector('.initiated');
      this.resetModal(initiatedItem);
      initiatedItem.focus();
      initiatedItem.classList.remove('initiated');
    });
    modalInput.addEventListener('input', (event) => {
      const inputStr = event.target.value;
      if (proxyableDirectAccess) {
        proxyableDirectAccess.setAttribute( 'href', this.proxyString(inputStr, prxyTyp) );
      }
      if (doiOpenAccess) {
        doiOpenAccess.setAttribute( 'href', this.openDOIString(inputStr) );
      }
      if (doiSummonAccess) {
        doiSummonAccess.setAttribute( 'href', this.summonDOIString(inputStr) );
      }
      if (itemIlliadAccess) {
        itemIlliadAccess.setAttribute( 'href', this.illiadURLString(inputStr, prxyTyp) );
      }
    });
  }

  handleIcon(input, modalEl) {
    const closestForm = input.closest('form');
    const icon = closestForm.querySelector('.proxyable-icon');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    icon.removeEventListener('click', icon.clickHandler);
    icon.clickHandler = () => {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    };
    icon.addEventListener('click', icon.clickHandler);
    icon.classList.remove("d-none");
    input.classList.add("initiated");
    return icon;
  }

  handlePaste(value, input) {
    value = value.trim();
    value = value.replace(/%2f/gi, '/');
    let match = value.match(this.doiRegex) || value.match(this.urlRegex);
    if (match) {
      const prxyStr = match[0];
      const prxyTyp = value.match(this.doiRegex) ? 'doi' : 'url';
      const modalEl = this.buildModal(prxyStr, prxyTyp);
      const icon = this.handleIcon(input, modalEl);
      this.showTooltip(icon, prxyTyp);
      this.initializeModalEventListeners(modalEl, prxyStr, prxyTyp);
    } else {
      this.resetModal(input);
    }
  }

  destroyModal(modalEl) {
    if (!modalEl) return;
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
      modalInstance.dispose();
    }
    modalEl.remove();
  }

  showTooltip(icon, prxyTyp) {
    const text = prxyTyp === 'doi' ? this.strings.doi.tooltip : this.strings.url.tooltip;
    let tooltip = new bootstrap.Tooltip(icon, {
      trigger: 'manual',
      title: text,
    });
    tooltip.show();
    setTimeout(() => icon.focus(), 100);
    icon.addEventListener('blur', () => tooltip.hide());
  }

  resetModal(input) {
    const closestForm = input.closest('form');
    const icon = closestForm.querySelector('.proxyable-icon');
    icon.classList.add("d-none");
    let tooltip = bootstrap.Tooltip.getInstance(icon);
    if (tooltip) {
      tooltip.hide();
    }
  }
}
