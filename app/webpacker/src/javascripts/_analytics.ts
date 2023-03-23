import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/max-scroll-tracker';
import 'autotrack/lib/plugins/page-visibility-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import {
  getCLS, getFCP, getFID, getLCP, getTTFB,
} from 'web-vitals';
import { actWithTimeOut } from './_utils';

interface GaDimensions {
  [key: string]: string;
}

// Google analytics custom dimensions
const gaDimensions: GaDimensions = {
  dimension1: 'access_facet',
  dimension2: 'resource_type_facet',
  dimension3: 'collection_facet',
  dimension4: 'building_facet',
  dimension5: 'shelf_facet',
  dimension6: 'publication_year_facet',
  dimension7: 'publication_decade_facet',
  dimension8: 'languages',
  dimension9: 'author_contributor_facet',
  dimension10: 'public_title_facet',
  dimension11: 'public_series_facet',
  dimension12: 'meeting_facet',
  dimension13: 'public_genre_facet',
  dimension14: 'public_subject_facet',
  dimension15: 'geographic_terms_facet',
  dimension16: 'era_terms_facet',
  dimension17: 'game_duration_facet_field',
  dimension18: 'game_players_facet_field',
  dimension19: 'game_age_facet_field',
  dimension20: 'newly_added_facet',
};

function allowTracking(): boolean {
  const dnt = (navigator.doNotTrack || (window as any).doNotTrack
               || (navigator as any).msDoNotTrack || (window as any).msDoNotTrack);
  return !(dnt === '1' || dnt === 'yes');
}

function init(): void {
  const trackingId = document.body.getAttribute('data-ga-tracking-id');

  if (trackingId) {
    window.ga = window.ga || ((...args: any[]) => {
      window.ga.q = window.ga.q || [];
      return window.ga.q.push(args);
    });

    window.ga('create', trackingId, 'auto');
    window.ga('require', 'eventTracker');
    window.ga('require', 'maxScrollTracker');
    window.ga('require', 'pageVisibilityTracker', {
      sendInitialPageview: true,
    });
    window.ga('require', 'outboundLinkTracker', {
      fieldsObj: {
        eventCategory: 'link - content - external',
        eventAction: `${window.location.pathname}${window.location.search}`,
      },
    });
    window.ga('set', 'anonymizeIp', true);
    window.ga('set', 'transport', 'beacon');
    console.log('analytics loaded');
  } else {
    console.warn('Google Analytics tracking ID is missing.');
  }
}

// Report javascript errors
function trackErrors(): void {
  if (window.addEventListener) {
    window.addEventListener('error', (e: ErrorEvent) => {
      if (e.lineno !== 0) {
        const ie: Event | undefined = window.event;
        const errMsg: string = e.message || (ie && (ie as any).errorMessage);
        const errSrc: string = e.filename || (ie && (ie as any).errorUrl);
        const errLine: number = e.lineno || (ie && (ie as any).errorLine);
        const gaCat: string = 'JavaScript Error';
        const gaAction: string = `${errMsg} in: ${errSrc} on line ${errLine}`;
        const bodyEl: HTMLElement = document.body;
        const gaLabel: string = bodyEl.dataset.blacklightContext || '';
        const url: string = document.location.href;

        (window as any).ga('send', 'event', gaCat, gaAction, `${gaLabel} - ${url}`, {
          nonInteraction: true,
        });
      }
    });
  }
}

// Track submitted searches
function trackSearchForm(): void {
  const bodyEl: HTMLElement = document.body;
  // eslint-disable-next-line no-undef
  const searchForms: NodeListOf<HTMLElement> = bodyEl.querySelectorAll('.search-query-form');

  searchForms.forEach((node: HTMLElement) => {
    node.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const category: string = `Search - ${window.location.search === '' ? 'home' : 'results'}`;
      const action: string = (node.querySelector('#search_field') as HTMLInputElement).value;
      const label: string = (node.querySelector('#q') as HTMLInputElement).value;
      const value: number = label.split(' ').length || 0;

      const dimensionValues: { [key: string]: string } = {};

      Object.entries(gaDimensions).forEach(([key]) => {
        // eslint-disable-next-line no-undef
        const facetNodes: NodeListOf<HTMLInputElement> = node.querySelectorAll(`input[name="f[${value}][]"`);
        dimensionValues[key] = Array.from(facetNodes).map((facetNode: HTMLInputElement) => facetNode.value).join(', ');
      });

      function submitForm(): void {
        (node as HTMLFormElement).submit();
      }

      (window as any).ga('send', 'event', category, action, label, value, {
        ...dimensionValues,
        hitCallback: actWithTimeOut(() => {
          submitForm();
        }),
      });
    });
  });
}

// Track Bib Record clicks
function trackShowRecordFacets(): void {
  const bodyEl: HTMLElement = document.body;
  const viewContext: string | undefined = bodyEl.dataset.blacklightContext;
  if (viewContext !== 'show') return;
  const mainContainer: HTMLElement | null = bodyEl.querySelector('#main-container');
  // eslint-disable-next-line no-undef
  const links: NodeListOf<HTMLElement> = <NodeListOf<HTMLElement>>mainContainer?.querySelectorAll('.result__value a') || new NodeList();

  links.forEach((node: HTMLElement) => {
    if (node.hasAttribute('ga-on')) return;
    const valueContainer: HTMLElement | null = node.closest('.result__value');
    if (valueContainer === null) return;
    const category: string = 'Bib Record';
    const action: string | undefined = valueContainer.dataset.cardTitle;
    const label: string | undefined = valueContainer.dataset.fieldName;

    node.setAttribute('ga-on', 'click');
    node.setAttribute('ga-event-category', category);
    node.setAttribute('ga-event-action', action || '');
    node.setAttribute('ga-event-label', label || '');
  });
}

// Track the position in search results of a document when clicked
// Called from the Blacklight search context handler
function trackDocPosition(link: HTMLElement): void {
  const bodyEl: HTMLElement = document.body;
  const viewContext: string | undefined = bodyEl.dataset.blacklightContext;
  if (viewContext !== 'index') return;

  const valueContainer: HTMLElement | null = link.closest('article.document');
  if (valueContainer === null) return;
  const category: string = 'List Item Link';
  const docPosition: number = parseInt(valueContainer.dataset.documentCounter || '0', 10) + 1;
  const action: string = 'Result Item Placement';
  const label: string = `Results # ${docPosition}`;
  const value: string = '1';

  window.ga('send', 'event', category, action, label, value);
}

// Track document position for links not bound in Blacklight search context
function trackNoContextDocPosition(): void {
  const bodyEl: HTMLElement = document.body;
  const viewContext: string | undefined = bodyEl.dataset.blacklightContext;
  if (viewContext !== 'index') return;
  const docContainer: HTMLElement | null = bodyEl.querySelector('#documents');
  if (docContainer === null) return;
  // eslint-disable-next-line no-undef
  const links: NodeListOf<HTMLAnchorElement> = docContainer.querySelectorAll('a:not([data-context-href])');

  links.forEach((node: HTMLAnchorElement) => {
    node.addEventListener('click', () => {
      trackDocPosition(node);
    });
  });
}

interface WebVitalsData {
  name: string;
  delta: number;
  id: string;
}

function sendWebVitalsToGoogleAnalytics({ name, delta, id }: WebVitalsData): void {
  window.ga('send', 'event', {
    eventCategory: 'Web Vitals',
    eventAction: name,
    eventValue: Math.round(name === 'CLS' ? delta * 1000 : delta),
    eventLabel: id,
    nonInteraction: true,
  });
}

function trackWebVitals(): void {
  getCLS(sendWebVitalsToGoogleAnalytics);
  getFID(sendWebVitalsToGoogleAnalytics);
  getLCP(sendWebVitalsToGoogleAnalytics);
  getFCP(sendWebVitalsToGoogleAnalytics);
  getTTFB(sendWebVitalsToGoogleAnalytics);
}

function addBrowserInfoToFeedback(): void {
  const header: (string | undefined | any)[] = [
    navigator.userAgent,
  ];

  const agent: string = header.join(' ');
  const agentString: string = encodeURIComponent(agent);

  // eslint-disable-next-line no-undef
  const feedbackLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a.feedback-email, a.feedback-url');

  feedbackLinks.forEach((node: HTMLAnchorElement) => {
    // eslint-disable-next-line no-param-reassign
    node.href = node.href.replace('%7B%7BuserAgent%7D%7D', agentString);
  });
}

export {
  allowTracking,
  init,
  trackErrors,
  trackSearchForm,
  trackShowRecordFacets,
  trackDocPosition,
  trackNoContextDocPosition,
  trackWebVitals,
  addBrowserInfoToFeedback,
};
