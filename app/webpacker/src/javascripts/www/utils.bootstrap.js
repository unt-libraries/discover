export class BootstrapOptIns {
	/**
	 * Constructor.
	 */
	constructor() {
		this.selectors = {
			tooltip: '[data-bs-toggle="tooltip"]',
			popover: '[data-bs-toggle="popover"]'
		};

		// autorun
		if (document.readyState !== 'loading') {
			this.init();
		} else {
			document.addEventListener('DOMContentLoaded', () => {
				this.init();
			});
		}
	}
	/**
	 * init opt in behaviors
	 */
	init() {
		// return early if bootstrap isn't defined
		if (typeof bootstrap === 'undefined') {
			return;
		}
		this.optInTooltips();
		this.optInPopovers();
	}
	/**
	 * Opt in to bootrap tooltips
	 */
	optInTooltips() {
		new bootstrap.Tooltip('body', {
			selector: this.selectors.tooltip,
		});
	}
	/**
	 * Opt in to bootrap tooltips,
	 * bind to wrapper element allowing for dynamic
	 * content insertion.
	 */
	optInPopovers() {
		new bootstrap.Popover('#main-container', {
			selector: this.selectors.popover,
		});
	}
}
