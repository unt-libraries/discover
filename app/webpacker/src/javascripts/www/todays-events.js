// Changes from source noted below with "EDITED"
// utils.js imports
import { fetchData, setWithExpiry, getWithExpiry } from './utils.js';
import dayjs from 'dayjs'; // EDITED to import dayjs
import advancedFormat from 'dayjs/plugin/advancedFormat'; // EDITED to import advancedFormat

dayjs.extend(advancedFormat); // EDITED to extend advancedFormat


export class EventManager {
  constructor() {
      this.config = window.wwwJsShims.events; // EDITED to use config on window object
      this.now = dayjs();
      this.init();
  }

  /**
   * Format Dates for display using day.js advanced plugin
   */
  formatEventDate = (startDate, endDate) => {
    const startDay = dayjs(startDate);
    const endDay = dayjs(endDate);

    const dateOptions = 'ddd, MMM D, h:mm A'; // Custom format
    let startFormatted = startDay.format(dateOptions);
    let endFormatted;

    if (startDay.isSame(endDay, 'day')) {
      // If the start and end dates are the same day, format only the time for the end date
      endFormatted = endDay.format('h:mm A');
    } else {
      // If the start and end dates are on different days, format the full date and time
      endFormatted = endDay.format(dateOptions);
    }

    return `${startFormatted} – ${endFormatted}`;
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
    const data = await fetchData(apiURL, 5000);
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
    return event.title && event.url && event.url.public && !event.title.toLowerCase().includes('private');
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

  makeCounter(filteredEvents) {
    console.log(filteredEvents);


    // remove duplicate items in filteredEvents that have the same title and reoccurs_future is true.
    filteredEvents = filteredEvents.filter((event, index, self) =>
      index === self.findIndex((t) => (
        t.title === event.title
      ))
    );

    console.log(filteredEvents);

    // Utility function to count events based on dayjs comparison
    const countEvents = (period, unit, when) => {
      return filteredEvents.filter(event => {
        const end = dayjs(event.end);
        const targetTime = this.now.add(period, unit);

        if (when === 'same') {
          return end.isSame(targetTime, 'day'); // checks only the day part
        }
        if (when === 'before') {
          return end.isBefore(targetTime); // checks up to the exact time
        }
      }).length;
    };

    // Get counts for different periods
    // "before" means up to the start of the target period, not including it
    const todaysCount = countEvents(1, 'day', 'before'); // events before the end of today
    const tomorrowsCount = countEvents(2, 'day', 'before'); // events before the end of tomorrow
    const nextWeekCount = countEvents(7, 'day', 'before'); // events before the end of the next 7 days
    const nextMonthCount = countEvents(1, 'month', 'before'); // events before the end of the next month
    const nextThreeMonthCount = countEvents(3, 'month', 'before'); // events before the end of the next three months

    console.log("today's count", todaysCount);
    console.log("tomorrow's count", tomorrowsCount);
    console.log("next week count", nextWeekCount);
    console.log("next month count", nextMonthCount);
    console.log("next 3 month count", nextThreeMonthCount);


    const itemCount = document.createElement('div');
    itemCount.classList.add('text-center');
    itemCount.textContent = `${todaysCount} ${tomorrowsCount} ${nextWeekCount} ${nextMonthCount} ${nextThreeMonthCount}`;

    return itemCount;
  }

  makeDay(group, date) {

    console.log(group)

    const dateParts = date.split('-');
    const month = dateParts[1];
    // get the 3 letter version of the month
    const monthName = dayjs(date).format('MMM');
    const day = dateParts[2];
    const items = group[date];

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

    const getTimeOnly = (date) => {
      return dayjs(date).hour() * 60 + dayjs(date).minute();  // Convert time to minutes since midnight
    };

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

    const icon = calendarIcon(month, day);

    eventElement.innerHTML = icon;
    eventElement.appendChild(makeList(items));
    return eventElement;
  }


  getDomElements(events) {
    const eventWrappers = document.querySelectorAll('.event-wrapper');
    eventWrappers.forEach(wrapper => {
      const campuses = wrapper.getAttribute('data-untl-event-campuses');
      const categories = wrapper.getAttribute('data-untl-event-categories');
      const kind = wrapper.getAttribute('data-untl-event-kind') || 'standard';
      let max = wrapper.getAttribute('data-untl-event-max');
      let maxDays = wrapper.getAttribute('data-untl-event-max-days') || 30;

      const eventBody = wrapper.querySelector(".card-body");

      let campusFilter = campuses ? campuses.split(',').map(item => item.trim()) : [];
      let categoryFilter = categories ? categories.split(',').map(item => item.trim()) : [];

      let filteredEvents = this.filterEventsByCriteria(events, {
          campuses: campusFilter,
          categories: categoryFilter
      });
      // reduce filteredEvents to max length
      //filteredEvents = filteredEvents.slice(0, max);
      if (max) {
        max = parseInt(max, 10);
        filteredEvents = filteredEvents.slice(0, max);
      }
      if (maxDays){
        maxDays = parseInt(maxDays, 10);
        const maxDate = this.now.add(maxDays, 'day');
        filteredEvents = filteredEvents.filter(event => dayjs(event.start).isBefore(maxDate));
      }
      // filter out events that have an end date before now
      filteredEvents = filteredEvents.filter(event => dayjs(event.end).isAfter(this.now));




        if (kind === 'count') {
          let counter = this.makeCounter(filteredEvents);
          eventBody.appendChild(counter);
        }
        if (kind === 'standard') {
          let groupedEvents = this.groupEventsByDate(filteredEvents);
          let eventDates = Object.keys(groupedEvents).map(date => {
            if (groupedEvents[date].length > 0) {
              const makeDay = this.makeDay(groupedEvents, date);
              eventBody.appendChild(makeDay);
            }
          });
        }





      // make a comma seperated list of all titles from groupedEvents
//      let eventTitles = Object.keys(groupedEvents).map(date => {
//        let events = groupedEvents[date];
//        let titles = events.map(event => event.title);
//        return `${date}: ${titles.join(', ')}`;
//      }).join('\n');
      // insert the eventTitles into the wrapper

      //eventBody.innerHTML = eventTitles;


      // Replace console.log with actual DOM manipulation logic
      //console.log(groupedEvents);
    });
  }

  loadEvents = async () => {
    let events = getWithExpiry(this.config.storageKey, true);
    if (!events) {
      events = await this.fetchAndProcessEvents();
      setWithExpiry(this.config.storageKey, events, 30 * 60000, true);
    }
    this.getDomElements(events);
  };

  async init() {
    if (document.readyState === 'loading') {  // Loading hasn't finished yet
      document.addEventListener('DOMContentLoaded', this.loadEvents);
    } else {  // `DOMContentLoaded` has already fired
      this.loadEvents();
    }
  }

}
