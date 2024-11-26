/**
 * Opt in to bootrap tooltips
 */
export const optInTooltips = () => {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	tooltipTriggerList.forEach(() => new bootstrap.Tooltip("body", { selector: '[data-bs-toggle="tooltip"]' }));
}

/**
 * Opt in to bootrap tooltips
 */

export const optInPopovers = () => {
	const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
	popoverTriggerList.forEach(() => new bootstrap.Popover("body", { selector: '[data-bs-toggle="popover"]' }));
}

/**
 * init opt in behaviors
 */

export const bootstrapOptIns = () => {
	// return early if bootstrap isn't defined
	if (typeof bootstrap === 'undefined') {
		return;
	}
	optInTooltips();
	optInPopovers();

};
