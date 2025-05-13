// Changes from source noted below with "EDITED"

// EDITED to export SearchDropdown class
export default class SearchDropdown {
  constructor(dropdownId, watchId, data) {
    this.dropdownId = dropdownId;
    this.watchId = watchId;
    this.data = data;
    this.initDropdown();
    this.attachEventListeners();
  }

  initDropdown() {
    const dropdownMenu = document.getElementById(this.dropdownId);
    dropdownMenu.innerHTML = this.data.map(item => {
      if (item.type === 'divider') {
        return `<div class="dropdown-divider"></div>`; // Bootstrap's class for dividers
      } else {
        return `
          <button class="dropdown-item" type="button" data-url-template="${item.urlTemplate}">
            ${item.label}
          </button>
        `;
      }
    }).join('');
  }


  attachEventListeners() {
    const dropdownMenu = document.getElementById(this.dropdownId);
    dropdownMenu.addEventListener('click', (event) => {
      if (event.target.classList.contains('dropdown-item')) {
        event.preventDefault();
        const urlTemplate = event.target.getAttribute('data-url-template');
        const searchTerm = document.getElementById(this.watchId).value;
        this.changeLocation(urlTemplate, searchTerm);
      }
    });
  }

  changeLocation(urlTemplate, searchTerm) {
    const fullUrl = urlTemplate.replace('{query}', encodeURIComponent(searchTerm));
    window.location.href = fullUrl;
  }
}
