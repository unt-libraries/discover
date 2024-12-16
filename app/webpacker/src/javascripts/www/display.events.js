// Changes from source noted below with "EDITED"
// utils.js imports
import { onDomReady, fetchData, setWithExpiry, getWithExpiry } from './utils.js';
import dayjs from 'dayjs'; // EDITED to import dayjs
import advancedFormat from 'dayjs/plugin/advancedFormat'; // EDITED to import advancedFormat
dayjs.extend(advancedFormat); // EDITED to extend advancedFormat

export class EventManager {
  constructor() {
      this.config = window.wwwJsShims.events; // EDITED to use config on window object
      this.now = dayjs();
      this.currentVersion = 'v1.2'; // Update this version as needed to force resets
      // autorun
      onDomReady(() => {
        this.init();
      });
  }

  formatTimeStr = (start, end, allday) => {
    if (allday) {
      return 'All Day';
    } else {
      let startStr = dayjs(start).format('h:mm A');
      let endStr = dayjs(end).format('h:mm A');
      return `${startStr}-${endStr}`;
    }
  }

  /**
   * Fetch, filter, and return a map of events.
   */
  fetchAndProcessEvents = async () => {
    const apiURL = `${this.config.apiURL}?${new URLSearchParams(this.config.apiArgs)}`;
    const data = await fetchData(apiURL, { timeout: 5000, retries: 3, retryDelay: 500 });
    return data.events
      .filter(
        event => this.isValidEvent(event) && this.isCampusIncluded(event.campus.id)
      )
      .map(event => ({
        //...event,
        title: event.title,
        allday: event.allday || false,
        url: event.url.public,
        location: event.location.name || false,
        campus: event.campus.name || false,
        registration: event.registration || false,
        seats: event.seats || false,
        reoccurs_future: event.future_dates.length > 0 || false,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : false,
        category: this.categorizeEvent(event)
      }));
  }

  /**
   * valid events must have a title, public url and not include 'private' in the title
   */
  isValidEvent = (event) => {
    // Check that the event has the minimal requirements
    if (!event.title || !event.url || !event.url.public) {
      return false;
    }
    // Check these fields for ignored words
    const fieldsToCheck = [
      event.title,
      event.description || '',
      event.presenter || ''
    ];
    const combinedText = fieldsToCheck.join(' ').toLowerCase();
    const ignoreList = this.config.ignore || [];
    // Check if any of the ignore terms appear in the combined text
    for (const term of ignoreList) {
      if (combinedText.includes(term.toLowerCase().trim())) {
        return false; // Found an ignored term, so this event is not valid.
      }
    }
    // If we get here, no ignored terms were found
    return true;
  }

  /**
   * Check if the event's campus is included in the allowedCampusIds array in config
   */
  isCampusIncluded = (campusId) => {
    return this.config.allowedCampusIds.includes(campusId);
  }

  /**
   * Categorize events based on keywords in the title, description, or campus name, default to genera
   * cats are based on values in config.categories.
   */
  categorizeEvent = (event) => {
    const searchFields = [event.title, event.description, event.campus.name].join(' ').toLowerCase();
    return Object.keys(this.config.categories).find(category =>
      this.config.categories[category].some(keyword => searchFields.includes(keyword))
    ) || 'general';
  }

  /**
   * Filter events based on the provided criteria
   */
  filterEventsByCriteria(events, {campuses = [], categories = []}) {
    return events.filter(event => {
      const campusCondition = campuses.length === 0 || campuses.includes(event.campus);
      const categoryCondition = categories.length === 0 || categories.includes(event.category);
      return campusCondition && categoryCondition;
    });
  }

  /**
   * group an array of items by their start date
   */
  groupEventsByDate(events) {
    return events.reduce((groupedEvents, event) => {
      const date = dayjs(event.start).format('YYYY-MM-DD');
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
      return groupedEvents;
    }, {});
  }

  /**
   * genereate events for a single day
   */
  makeDay(group, date, isLastItem) {
    const dateParts = date.split('-');
    const month = dateParts[1];
    // get the 3 letter version of the month
    const monthName = dayjs(date).format('MMM');
    const day = dateParts[2];
    const items = group[date];

    // calendar icon
    const calendarIcon = (month, day) => {
      return `
        <div class="text-center">
          <span class="fa-layers fa-fw fa-5x d-block mb-2">
            <i class="fad fa-calendar"></i>
            <span class="fa-layers-text fa-inverse text-uppercase"
                  data-fa-transform="shrink-14 up-4">${monthName}</span>
            <span class="fa-layers-text fa-inverse"
                  data-fa-transform="shrink-8 down-3">${day}</span>
          </span>
        </div>`;
    }

    // shorten titles, cause some of these things are looooong.
    const makeShortTitle = (title) => {
      let shortTitle = title;
      // check if the title contains a colon
      if (title.includes(':') && title.toLowerCase().includes('spark')) {
        shortTitle = title.split(':')[1].trim();
      }
      // add spaces between / and alphanumeric characters to prevent runons
      if (shortTitle.includes('/')) {
        shortTitle = shortTitle.replace(/\/([a-zA-Z0-9])/g, '/ $1');
      }
      // truncate and add elipse to shorTitles longer than 50 characters.
      if (shortTitle.length > 50) {
        shortTitle = shortTitle.substring(0, 50) + '...';
      }
      return shortTitle;
    }

    // a single list item in the day.
    const makeItem = (item) => {
      const rangeStr = this.formatTimeStr(item.start, item.end, item.allday);
      const shortTitle = makeShortTitle(item.title);
      // first letter of each word in campus
      //const abbrev = item.campus.split(' ').map(word => word[0]).join('');
      const locationStr = item.location ? `${item.location}, ${item.campus}` : '${item.campus}';
      return `
        <li>
          <span class="badge text-bg-dark">${rangeStr}</span>
          <a href="${item.url}" class="text-decoration-none link-dark-green">
            ${shortTitle}
          </a>
        </li>`;
    }

    // make an unordered list of titles from items.
    const makeList = (items) => {
      const list = document.createElement('ul');
      list.classList.add('list-unstyled');
      let itemContent = '';
      items.forEach(item => {
        const itemEl = makeItem(item);
        itemContent += itemEl;
      });
      list.innerHTML = itemContent;
      return list;
    }

    // create a div
    const eventElement = document.createElement('div');
    eventElement.className = 'd-flex py-2 border-bottom border-secondary position-relative';

    // if last item remove the border classes
    if (isLastItem) {
      eventElement.classList.remove('border-bottom');
    }
    // make an icon
    const icon = calendarIcon(month, day);
    // make and return the element
    eventElement.innerHTML = icon;
    eventElement.appendChild(makeList(items));
    return eventElement;
  }


  /**
   * Build event DOM eleements using configs set on DOM data- attributes.
   */
  insertEventsToDom(events) {
    // gather all the event wrapper elements
    const eventWrappers = document.querySelectorAll('.event-wrapper');
    eventWrappers.forEach(wrapper => {
      // get parse details for each dom element which will control which events show in this element
      const campuses = wrapper.getAttribute('data-untl-event-campuses');
      const categories = wrapper.getAttribute('data-untl-event-categories');
      const kind = wrapper.getAttribute('data-untl-event-kind') || 'standard';
      let max = wrapper.getAttribute('data-untl-event-max');
      let maxDays = wrapper.getAttribute('data-untl-event-max-days') || 30;
      const eventBody = wrapper.querySelector(".card-body");

      // filter lists, categories and caompuses
      let campusFilter = campuses ? campuses.split(',').map(item => item.trim()) : [];
      let categoryFilter = categories ? categories.split(',').map(item => item.trim()) : [];

      let filteredEvents = this.filterEventsByCriteria(events, {
          campuses: campusFilter,
          categories: categoryFilter
      });
      // max items filter
      if (max) {
        max = parseInt(max, 10);
        filteredEvents = filteredEvents.slice(0, max);
      }
      // max days filter
      let maxDate = null;
      if (maxDays){
        maxDays = parseInt(maxDays, 10);
        maxDate = this.now.add(maxDays, 'day');
        filteredEvents = filteredEvents.filter(event => dayjs(event.start).isBefore(maxDate));
      }
      // filter out events in the past
      filteredEvents = filteredEvents.filter(event => dayjs(event.end).isAfter(this.now));

      // for now everythign is a standard display. TODO support other kinds in the future.
      if (kind === 'standard') {
        let groupedEvents = this.groupEventsByDate(filteredEvents);
        let eventDates = Object.keys(groupedEvents);
        eventDates.map((date, index) => {
          if (groupedEvents[date].length > 0) {
            // Determine if this is the last item in the array
            const isLastItem = index === eventDates.length - 1;
            // Pass isLastItem as the third argument to this.makeDay
            const makeDay = this.makeDay(groupedEvents, date, isLastItem);
            eventBody.appendChild(makeDay);
          }
        });
        // test to see if groupedEvents is false. Append no events message if so.
        if (Object.keys(groupedEvents).length === 0) {
          const noEvents = document.createElement('p');

          const upcomingFragment = maxDays ? `There are no events scheduled between now and ${maxDate.format('MMMM D, YYYY')}` : 'There are no upcoming events.';

          const noEventsMessage = `
            ${upcomingFragment}. <a href="{{ site.data.urls.calendar.events }}">See our complete calendar for future events.</a>
            `;
          noEvents.innerHTML = noEventsMessage;
          eventBody.appendChild(noEvents);

        }
      }
    });
  }

  async init() {
    // get existing events from storage
    let events = getWithExpiry(this.config.storageKey, this.currentVersion, true);
    if (!events) {
      // no events fetch fress events from libcal
      events = await this.fetchAndProcessEvents();
      // refresh every 30 minutes or when script version change.
      setWithExpiry(this.config.storageKey, events, 30 * 60000, this.currentVersion, true);
    }
    // build the display
    this.insertEventsToDom(events);
  };
}
