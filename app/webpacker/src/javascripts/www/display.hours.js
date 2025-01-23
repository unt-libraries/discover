// Changes from source noted below with "EDITED"
import dayjs from 'dayjs'; // EDITED to import dayjs
import utc from 'dayjs/plugin/utc'; // EDITED to import utc
import timezone from 'dayjs/plugin/timezone'; // EDITED to import timezone
import { setWithExpiry, getWithExpiry, fetchData } from './utils.js';
import { DropdownManager } from './display.dropdowns.js';

// Extend day.js with the plugins
dayjs.extend(utc); // EDITED to extend utc
dayjs.extend(timezone); // EDITED to extend timezone

/**
 * Manages operational hours fetched from the LibCal API, updates DOM elements, and constructs weekly tables.
 */
export class LibraryHours {
    constructor(dropdownManager) {
      this.config = window.wwwJsShims.hours; // EDITED to use config on window object
      this.currentVersion = 'v1.1.1'; // Update this version as needed to force resets
      dropdownManager.ready.then(() => this.init());
    }

  async init() {
    let storedHours = getWithExpiry(this.config.storageKey, this.currentVersion, true); // Attempt to get stored hours from session storage
    if (storedHours === null) {
      storedHours = await this.fetchHours(); // Fetch and store hours if not present
    }
    this.setTodaysDate();
    this.setHTMLElementHours(storedHours.week); // Update the DOM using today's hours
    this.generateWeeklyTable(storedHours.week); // Generate weekly hours table if applicable
  }

  setHTMLElementHours(weekHours) {
    const liveHoursElements = document.querySelectorAll(".live-hours");
    liveHoursElements.forEach(element => {
      const id = parseInt(element.getAttribute('data-untl-hours-id'), 10);
      // get the hours for the first day

      const hoursData = weekHours.find(item => item.lid === id).days[0];
      if (hoursData) {
        element.textContent = hoursData.time; // Update the text content with the hours
      }
      else {
        element.textContent = "Call";
      }
    });
  }

  setTodaysDate() {
    const todayElement = document.querySelector('#todays-date');
    if (todayElement) {
      todayElement.textContent = dayjs().tz('America/Chicago').format('dddd, MMMM D.');
    }
  }

  async fetchHours() {
    const spacesArray = this.config.spaces.map(space => space.cid);
    //const url = `${this.config.calendarUrl}${this.config.endPoint}${spacesArray.join(',')}?key=${this.config.pubKey}`;
    const url = `${this.config.calendarUrl}${this.config.endPoint}${spacesArray.join(',')}`;
    const today = dayjs().tz('America/Chicago');
    const todayFormatted = today.format('YYYY-MM-DD');
    const nextWeek = today.add(7, 'days').format('YYYY-MM-DD');
    const hoursData = await fetchData(`${url}?from=${todayFormatted}&to=${nextWeek}`, { timeout: 30000, retries: 3, retryDelay: 500 }); // 30-second timeout // with proxy!

    if (!hoursData) {
      console.error('Failed to fetch library hours');
      return;
    }

    let weekHours = hoursData.map(el => {
      return {
        lid: el.lid,
        name: el.name,
        days: el.dates ? Object.keys(el.dates).map(date => ({
          date: date,
          time: this.formatHours(el.dates[date])
        })) : []
      };
    });

    const todayHours = weekHours.map(location => {
      const todayData = location.days.find(day => day.date === todayFormatted);
      return {
        lid: location.lid,
        name: location.name,
        time: todayData ? this.formatHours(todayData.time) : "Call"  // Provide default if no data found
      };
    });

    const storeData = { today: todayHours, week: weekHours };
    setWithExpiry(this.config.storageKey, storeData, this.config.expires, this.currentVersion, true);
    console.log("Hours refreshed.");
    return storeData;
  }

  formatHours(currentDay) {
    if (!currentDay) return "Call";
    const status = currentDay.status;
    const hours = currentDay.hours && currentDay.hours.length > 0 && currentDay.hours[0].from && currentDay.hours[0].to
      ? `${currentDay.hours[0].from}-${currentDay.hours[0].to}`
      : "Call";
    switch (status) {
      case "24hours":
        return "Open 24 hours";
      case "ByApp":
        return "By appointment";
      case "closed":
        return "Closed";
      default:
        return hours;
    }
  }

  generateWeeklyTable(weekHours) {
    const hourTableDiv = document.querySelector('[data-untl-hours-table]');
    if (!hourTableDiv) return;

    const lidFilter = hourTableDiv.getAttribute('data-untl-hours-table').split(',');
    const filteredData = weekHours.filter(hour => lidFilter.includes(String(hour.lid)));
    const baseDate = dayjs().tz('America/Chicago');  // Starting from today

    let tableHTML = '<table class="table table-striped table-hover"><tr class="table-success"><th>Location</th>';
    for (let i = 0; i < 7; i++) {
      const className = i === 0 ? 'table-dark opacity-75' : '';
      const headerDate = baseDate.add(i, 'days');
      tableHTML += `<th class="${className}">${headerDate.format('MMM DD</br />dddd')}</th>`;
    }
    tableHTML += '</tr>';

    filteredData.forEach(location => {
      tableHTML += `<tr><td>${location.name}</td>`;
      for (let i = 0; i < 7; i++) {
        // if first iteration store classnames for today
        const className = i === 0 ? 'bg-info bg-opacity-10' : '';
        const dateKey = baseDate.add(i, 'days').format('YYYY-MM-DD');
        const dayInfo = location.days.find(day => day.date === dateKey);
        const displayTime = dayInfo ? dayInfo.time : 'Call';  // Ensuring a value is always displayed
        tableHTML += `<td class="${className}">${displayTime}</td>`;
      }
      tableHTML += '</tr>';
    });

    tableHTML += '</table>';
    hourTableDiv.innerHTML = tableHTML;
  }
}
