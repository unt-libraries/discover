import { onDomReady } from './utils.js';

export class GuideManager {
    constructor(url) {
        this.url = url;
        this.inject = document.querySelector('#libguides.inject');
        this.guideNavLink = document.querySelector(".guides-link");
        this.guidesWrapper = document.querySelector(".guides-wrapper");
        // autorun
        onDomReady(() => {
            this.init();
        });
    }

    async init() {
        try {
            const response = await fetch(this.url);
            const data = await response.json();
            if (data.length !== 0) {
                const subjectGuides = data.filter(this.isSubjectGuide);
                const courseGuides = data.filter(this.isCourseGuide);
                const otherGuides = data.filter(this.isOtherGuide);

                this.inject.innerHTML = ''; // Clear the container

                const accordion = document.createElement('div');
                accordion.id = 'guidesAccordion';
                accordion.classList.add('accordion', 'accordiant-flush');
                this.inject.appendChild(accordion);

                if (subjectGuides.length !== 0) {
                    this.addAccordionItem(accordion, 'Subject Guides', subjectGuides, this.buildStandardList.bind(this));
                }
                if (otherGuides.length !== 0) {
                    this.addAccordionItem(accordion, 'Topic Guides', otherGuides, this.buildStandardList.bind(this));
                }
                if (courseGuides.length !== 0) {
                    this.addAccordionItem(accordion, 'Course Guides', courseGuides, this.buildCourseList.bind(this));
                }
                // Add a listener for the accordion shown event
                accordion.addEventListener('shown.bs.collapse', (event) => {
                    const expandedElement = event.target; // The element that was just shown
                    const headerElement = expandedElement.previousElementSibling; // Find the corresponding header
                    if (headerElement) {
                        headerElement.scrollIntoView({ behavior: 'instant', block: 'start' });
                    }
                });
            } else {
                // hide the guide header if there are 0 guides
                this.guideNavLink?.classList.add("d-none");
                this.guidesWrapper?.classList.add("d-none");
            }
        } catch (error) {
            console.error('Failed to fetch guides:', error);
            // Construct the fallback URL
            let fallbackUrl = 'https://guides.library.unt.edu'; // Default URL
            const urlParams = new URL(this.url).searchParams;
            const subjectIds = urlParams.get('subject_ids');

            if (subjectIds) {
                if (subjectIds.includes(',')) {
                    fallbackUrl = 'https://guides.library.unt.edu'; // Default URL if multiple IDs are present
                } else {
                    fallbackUrl = `https://guides.library.unt.edu/sb.php?subject_id=${subjectIds}`;
                }
            }

            // Create and append the fallback link
            const link = document.createElement('a');
            link.href = fallbackUrl;
            link.textContent = 'View Our Guides';
            link.classList.add('btn', 'btn-link', 'mt-3');
            this.inject.innerHTML = ''; // Clear the container
            this.inject.appendChild(link);

        }
    }

    addAccordionItem(accordion, title, guides, buildContent) {
        const id = title.toLowerCase().replace(/\s+/g, '-');
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item', 'border-0', 'border-2', 'border-bottom', 'border-mellow-limey', 'rounded-0');

        const accordionHeader = document.createElement('h2');
        accordionHeader.classList.add('accordion-header');
        accordionHeader.id = `${id}-header`;

        const accordionButton = document.createElement('button');
        accordionButton.classList.add('accordion-button', 'rounded-0', 'collapsed');
        accordionButton.type = 'button';
        accordionButton.dataset.bsToggle = 'collapse';
        accordionButton.dataset.bsTarget = `#${id}-content`;
        accordionButton.setAttribute('aria-expanded', 'false');
        accordionButton.setAttribute('aria-controls', `${id}-content`);

        const guideCount = guides.length;
        const formattedTitle = `${title} (${guideCount})`

        accordionButton.textContent = formattedTitle;

        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);

        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = `${id}-content`;
        accordionCollapse.classList.add('accordion-collapse', 'collapse');
        accordionCollapse.setAttribute('aria-labelledby', `${id}-header`);
        accordionCollapse.dataset.bsParent = '#guidesAccordion';

        const accordionBody = document.createElement('div');
        accordionBody.classList.add('accordion-body', 'px-0');

        // Use the provided build function to populate the accordion body
        buildContent(guides, title, accordionBody);

        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionCollapse);
        accordion.appendChild(accordionItem);
    }

    isCourseGuide(guide) {
        return guide.type_label === 'Course Guide';
    }

    isSubjectGuide(guide) {
        return guide.type_label === 'Subject Guide';
    }

    isOtherGuide(guide) {
        return guide.type_label !== 'Course Guide' && guide.type_label !== 'Subject Guide';
    }

    buildStandardList(guides, title, container) {
        const list = document.createElement('div');
        list.classList.add('row', 'row-cols-1', 'row-cols-lg-2', 'row-cols-xl-3');
        guides.forEach(guide => {
            let path = guide.redirect_url || guide.friendly_url || guide.url;
            path += `${path.includes('?') ? '&' : '?'}utm_source=www&utm_medium=staff_profile`;
            const item = document.createElement('div');
            item.classList.add('col', 'mb-4');
            const card = document.createElement('div');
            card.classList.add('card', 'h-100', 'position-relative', 'border-light-green', 'btn', 'btn-light-green', 'text-start');
            item.appendChild(card);
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            let description = guide.description || "";
            description = description ? `<p>${description}</p>` : "";
            card.appendChild(cardBody);
            const link = document.createElement('a');
            link.href = path;
            link.classList.add('card-title', 'text-uppercase', 'h6', 'stretched-link', 'link-dark-green');
            link.innerHTML = guide.name;
            cardBody.appendChild(link);
            cardBody.innerHTML += description;
            const cardFooter = document.createElement('div');
            cardFooter.classList.add('card-footer', 'small', 'border-0', 'bg-transparent');
            let updated = new Date(guide.updated);
            updated = `${updated.getMonth() + 1}/${updated.getDate()}/${updated.getFullYear()}`;
            cardFooter.innerHTML = `updated: ${updated}`;
            card.appendChild(cardFooter);
            list.appendChild(item);
        });
        container.appendChild(list);
    }

    buildCourseList(guides, title, container) {
        const sectionGuides = guides.map(guide => ({
            ...guide,
            section: guide.name.substring(0, guide.name.indexOf(' ')).replace(/[^A-Za-z0-9\s]/g, '').toUpperCase()
        }));

        const groupedGuides = this.groupBy(sectionGuides, 'section');

        for (const [section, items] of Object.entries(groupedGuides)) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'mb-4';
            const sectionHeading = document.createElement('h3');
            sectionHeading.textContent = section;
            sectionDiv.appendChild(sectionHeading);

            const ul = document.createElement('ul');
            ul.classList.add('fa-ul');
            items.forEach(guide => {
                let path = guide.redirect_url || guide.friendly_url || guide.url;
                path += `${path.includes('?') ? '&' : '?'}utm_source=www&utm_medium=staff_profile`;
                const li = document.createElement('li');
                li.classList.add('mb-2');
                const link = document.createElement('a');
                link.href = path;
                link.textContent = guide.name;
                li.appendChild(link);
                ul.appendChild(li);
            });
            sectionDiv.appendChild(ul);
            container.appendChild(sectionDiv);
        }
    }

    groupBy(data, key) {
        return data.reduce((storage, item) => {
            const group = item[key];
            storage[group] = storage[group] || [];
            storage[group].push(item);
            return storage;
        }, {});
    }
}
