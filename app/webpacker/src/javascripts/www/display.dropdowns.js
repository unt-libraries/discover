// Changes from source noted below with "EDITED"
import { fetchData } from './utils.js';

export class DropdownManager {
	constructor(config = {}) {
		this.config = {
			baseURL: window.location.origin, // Default to current domain for relative paths
			dataSrc: '/assets/omni/data/dropdowns.json',
			...config,
		};
		this.classStrings = {
			dropdown_menu: window.wwwJsShims.dropdowns.classes.dropdown_menu, // EDITED to use config on window object
			dropdown_last_item: window.wwwJsShims.dropdowns.classes.dropdown_last_item, // EDITED to use config on window object
			mega_menu: window.wwwJsShims.dropdowns.classes.mega_menu, // EDITED to use config on window object
			mega_headings: window.wwwJsShims.dropdowns.classes.mega_headings, // EDITED to use config on window object
			mega_heading_links: window.wwwJsShims.dropdowns.classes.mega_heading_links, // EDITED to use config on window object
			mega_links: window.wwwJsShims.dropdowns.classes.mega_links, // EDITED to use config on window object
			mega_icon_links: window.wwwJsShims.dropdowns.classes.mega_icon_links, // EDITED to use config on window object
			mega_link_annotation: window.wwwJsShims.dropdowns.classes.mega_link_annotation, // EDITED to use config on window object
		};
		this.ready = new Promise(resolve => {
			this.resolveReady = resolve;
		});
		this.init();
	}

	async init() {
		const data = await fetchData(this.config.dataSrc, { timeout: 5000, retries: 3, retryDelay: 500 });
		// break if data fetch fails
		if (!data) {
			console.error('Initialization failed due to fetch error.');
			this.defaultBehaviorNoDropdownData();
			return;
		}
		this.renderAllMenus(data);
		this.resolveReady();
	}

	resolveURL(path) {
		try {
			// If the path is already an absolute URL, the constructor will parse it successfully
			const url = new URL(path);
			// Check if it's a valid absolute URL
			if (url.protocol === "http:" || url.protocol === "https:") {
				return path; // Return the original absolute URL
			}
		} catch (e) {
			// If URL constructor fails, it's a relative path
		}
		// Combine baseURL with relative path
		return new URL(path, this.config.baseURL).href;
	}

	defaultBehaviorNoDropdownData() {
		const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
		dropdownToggles.forEach(toggle => {
			toggle.removeAttribute('data-bs-toggle');
			toggle.removeAttribute('aria-expanded');
			const svg = toggle.querySelector('svg');
			if (svg) {
				svg.classList.add('d-none');
			}
		});
	}

	renderAllMenus(data) {
		for (let menu_obj in data) {
			for (let obj of data[menu_obj]) {
				let index = data[menu_obj].indexOf(obj) + 1;
				if (obj.type === 'dropdown') {
					this.renderDropdownMenu(obj, menu_obj, index);
				} else if (obj.type === 'mega-menu') {
					this.renderMegaMenu(obj, menu_obj, index);
				}
			}
		}
	}

	renderDropdownMenu(obj, menu_obj, index) {
		let dropdown_config = {
			id: `${menu_obj}-item-${index}`,
			min_width: obj.min_width,
			children: obj.items
		};
		let rendered = this.templates.renderDropdownMenu(dropdown_config, this.classStrings);
		this.insertRenderedMenu(rendered, dropdown_config.id);
	}

	renderMegaMenu(obj, menu_obj, index) {
		let dropdown_config = {
			id: `${menu_obj}-item-${index}`,
			obj: obj,
		};
		let rendered = this.templates.renderMegaMenu(dropdown_config, this.classStrings);
		this.insertRenderedMenu(rendered, dropdown_config.id);
	}

	insertRenderedMenu(rendered, id) {
		let insertion_point = document.querySelector(`#${id}-dropdown`);
		// test for existence of insertion point
		if (!insertion_point) {
			return;
		}
		insertion_point.insertAdjacentHTML('beforeend', rendered);
		//this.initNewTooltip(insertion_point);
	}

	initNewTooltip(element) {
		const tooltips = element.querySelectorAll('[data-bs-toggle="tooltip"]');
		tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
	}

	templates = {
		renderDivider: (item) => {
			const divider = `<li class="${item.classes ? item.classes : ''}"
                           id="${item.parent_id}-dropdown-item-${item.index}">
                           <hr class="dropdown-divider">
                       </li>`;
			return divider;
		},
		renderIcon: (icon) => {
			const span = icon ? `<span class="${icon}"></span>` : '';
			return span;
		},
		renderInfoIcons: (item) => {
			let icons = "";
			for (let icon of item.icons) {
				icon.text = icon.text ? icon.text : item.parent_text;

				if(icon.url){
					let url = this.resolveURL(icon.url);
					icons += `<a href="${url}"
                         class="${this.classStrings.mega_icon_links}"
                         data-bs-toggle="tooltip"
                         data-bs-title="${icon.text}">
                        <span class="${icon.icon_classes} fa-fw"></span>
                      </a>`;
				} else {
					icons += `<span data-bs-toggle="tooltip"
                          data-bs-title="${icon.text}">
                        <span class="${icon.icon_classes} text-body-tertiary fa-fw"></span>
                      </span>`;
				}
			}
			return icons;
		},
		renderAnnotation: (item) => {
			const annotation = `<div class="${this.classStrings.mega_link_annotation}">
                            ${item.annotation}
                          </div>`;
			return annotation;
		},
		renderText: (item) => {
			// null values to empty string
			item.classes = item.classes ? item.classes : '';
			// append classStrings.dropdown_last_item to the last item in the list
			item.classes += item.is_last ? ` ${this.classStrings.dropdown_last_item}` : '';
			const text = `<li class="text-unset px-3 fw-light ${item.classes}"
                       id="${item.parent_id}-dropdown-item-${item.index}">
                         ${this.templates.renderIcon(item.icon_classes)}
                         ${item.text}
                     </li>`;
			return text;
		},
		renderDropdownLink: (item) => {
			// null values to empty string
			item.classes = item.classes ? item.classes : '';
			// append classStrings.dropdown_last_item to the last item in the list
			item.classes += item.is_last ? ` ${this.classStrings.dropdown_last_item}` : '';
			const url = this.resolveURL(item.url);
			const link = `<li id="${item.parent_id}-dropdown-item-${item.index}">
                        <a href="${url}"
                         class="dropdown-item darker ${item.classes}">
                          ${this.templates.renderIcon(item.icon_classes)}
                          ${item.text}
                        </a>
                    </li>`;
			return link;
		},
		renderHours: (item) => {
			// null values to empty string
			item.classes = item.classes ? item.classes : '';
			// append classStrings.dropdown_last_item to the last item in the list
			item.classes += item.is_last ? ` ${this.classStrings.dropdown_last_item}` : '';
			const url = this.resolveURL(item.url);
			const elem = `<li id="${item.parent_id}-dropdown-item-${item.index}">
                        <a href="${url}"
                          class="dropdown-item darker d-flex justify-content-between ${item.classes}">
                          <span>
                            ${this.templates.renderIcon(item.icon_classes)}
                            ${item.text}
                          </span>
                          <span class="live-hours badge text-secondary-emphasis small"
                              data-untl-hours-id="${item.cid}"></span>
                        </a>
                    </li>`;
			return elem;
		},
		renderMegaMenuLink: (item) => {
			// null values to empty string
			item.classes = item.classes ? item.classes : '';
			item.caret_icon = item.caret_icon ? item.caret_icon : 'fas fa-caret-right text-success';
			item.parent_text = item.text;
			const info_icons = item.icons ? this.templates.renderInfoIcons(item) : '';
			const annotation = item.annotation ? this.templates.renderAnnotation(item) : '';
			const url = this.resolveURL(item.url);
			let inner = "";
			if (info_icons === "") {
				inner = `<a href="${url}"
                    class="${this.classStrings.mega_links} ${item.classes}">
                  ${this.templates.renderIcon(item.icon_classes)}
                  ${item.text}
                 </a>`;
			} else {
				inner = `<span class="d-flex justify-content-between">
                  <a href="${url}"
                     class="flex-fill ${this.classStrings.mega_links} ${item.classes}">
                      ${this.templates.renderIcon(item.icon_classes)}
                      ${item.text}
                  </a>
                  <span>
                      ${info_icons}
                  </span>
                </span>`;
			}
			const link = `<li class="mb-2 py-1">
                    <span class="fa-li d-none d-md-block">
                      <span class="${item.caret_icon}"></span>
                    </span>
                    ${inner}
                    ${annotation}
                </li>`;
			return link;
		},
		renderMegaMenuList: (group_obj) => {
			let list = '';
			for (let item of group_obj.items) {
				// the forloop index + 1
				item.index = group_obj.items.indexOf(item) + 1;
				item.parent_id = group_obj.id;
				if (item.type === 'divider') {
					list += this.templates.renderDivider(item);
				}
				else if (item.type === 'link') {
					list += this.templates.renderMegaMenuLink(item);
				}
				else {
					continue;
				}
			}
			return list;
		},
		renderDropdownList: (entry) => {
			let list = '';
			for (let item of entry.children) {
				// the forloop index + 1
				item.index = entry.children.indexOf(item) + 1;
				item.parent_id = entry.id;
				// set a boolean value to indicate if this is the last item in the list
				item.is_last = item.index === entry.children.length;
				if (item.type === 'divider') {
					list += this.templates.renderDivider(item);
				}
				else if (item.type === 'text') {
					list += this.templates.renderText(item);
				}
				else if (item.type === 'link') {
					list += this.templates.renderDropdownLink(item);
				}
				else if (item.type === 'hour') {
					list += this.templates.renderHours(item);
				}
				else {
					continue;
				}
			}
			return list;
		},
		renderDropdownMenu: (entry) => {
			const minWidth = entry.min_width ? `style="min-width:${entry.min_width}px;"` : '';
			const menu = `<ul class="${this.classStrings.dropdown_menu}" ${minWidth}
                      id="${entry.id}-dropdown-menu">
                      ${this.templates.renderDropdownList(entry)}
                    </ul>`;
			return menu;
		},
		renderGroupHeading: (group_obj) => {
			const inner_content = group_obj.url ? `<a href="${this.resolveURL(group_obj.url)}" class="${this.classStrings.mega_heading_links}">${group_obj.heading}</a>` : `${group_obj.heading}`;
			const heading = `<h3 class="${this.classStrings.mega_headings}">
                         ${inner_content}
                       </h3>`;
			return heading;
		},
		renderGroupList: (group_obj) => {
			group_obj.classes = 'test_string';
			const list = `<ul class="fa-ul ms-0 ms-lg-4 mb-0 mb-lg-2 ${group_obj.classes || ""}">
                      ${this.templates.renderMegaMenuList(group_obj)}
                    </ul>`;
			return list;
		},
		renderColumnGroup: (group_obj) => {
			const column = `<div class="m-lg-3 mx-0 my-3 ${group_obj.classes || "" }">
                          ${group_obj.heading ? this.templates.renderGroupHeading(group_obj) : ''}
                          ${group_obj.items ? this.templates.renderGroupList(group_obj) : ''}
                      </div>`;
			return column;
		},
		renderMegaColumnGroups: (column_obj) => {
			let groups = '';
			for (let group_obj of column_obj.groups) {
				groups += this.templates.renderColumnGroup(group_obj);
			}
			return groups;
		},
		renderMegaColumn: (column_obj) => {
			const column = `<div class="${column_obj.classes}">
                          ${this.templates.renderMegaColumnGroups(column_obj)}
                      </div>`;
			return column;
		},
		renderColumns: (columns) => {
			let cols = '';
			for (let column_obj of columns) {
				cols += this.templates.renderMegaColumn(column_obj);
			}
			return cols;
		},
		renderMegaMenu: (entry) => {
			const menu = `<div class="${this.classStrings.mega_menu}"
                         id="${entry.id}-dropdown-menu">
                      <div class="container-fluid">
                        <div class="container-3xl px-0 px-lg-2">
                          <div class="row g-2">
                            ${this.templates.renderColumns(entry.obj.columns)}
                          </div>
                        </div>
                      </div>
                    </div>`;
			return menu;
		}
	}
}
