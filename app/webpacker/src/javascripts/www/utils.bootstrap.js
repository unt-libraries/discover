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
		const tooltipTriggerList = document.querySelectorAll(this.selectors.tooltip);
		const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
	}
	/**
	 * Opt in to bootrap tooltips
	 */
	optInPopovers() {
		const popoverTriggerList = document.querySelectorAll(this.selectors.popover);
		const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
	}
}
