class GuideManager {
    constructor(url) {
        this.url = url;
    }

    init() {
        this.fetchGuides();
    }

    async fetchGuides() {
        try {
            const response = await fetch(this.url);
            const data = await response.json();
            if (data.length !== 0) {
                const subjectGuides = data.filter(this.isSubjectGuide);
                const courseGuides = data.filter(this.isCourseGuide);
                const otherGuides = data.filter(this.isOtherGuide);

                if (subjectGuides.length !== 0) {
                    this.buildStandardList(subjectGuides, 'Subject Guides');
                }
                if (otherGuides.length !== 0) {
                    this.buildStandardList(otherGuides, 'Topic Guides');
                }
                if (courseGuides.length !== 0) {
                    this.buildCourseList(courseGuides, 'Course Guides');
                }
            }
        } catch (error) {
            console.error('Failed to fetch guides:', error);
        }
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

    buildStandardList(guides, title = 'Guides') {
        const container = document.querySelector('#libguides');
        const heading = document.createElement('h2');
        const slug = title.toLowerCase().replace(/\s+/g, '-');
        heading.id = slug;
        heading.textContent = title;
        const list = document.createElement('div');
        list.classList.add('row',
            'row-cols-lg-2',
            'row-cols-xl-3'
        );
        guides.forEach(guide => {
            let path = guide.redirect_url || guide.friendly_url || guide.url;
            path += `${path.includes('?') ? '&' : '?'}utm_source=www&utm_medium=staff_profile`;
            const item = document.createElement('div');
            item.classList.add("col", 'mb-4');
            const card = document.createElement('div');
            card.classList.add(
                'card',
                'h-100',
                'position-relative',
                'border-light-green',
                'btn',
                'btn-light-green',
                'text-start'
            );
            item.appendChild(card);
            const cardBody = document.createElement('div');
            cardBody.classList.add(
                'card-body',
            );
            let description = guide.description || "";
            description = description ? `<p>${description}</p>` : "";
            card.appendChild(cardBody);
            const link = document.createElement('a');
            link.href = path;
            link.classList.add(
                'card-title',
                'text-uppercase',
                'h6',
                'stretched-link',
                'link-dark-green'
            );
            link.innerHTML = guide.name;
            cardBody.appendChild(link);
            cardBody.innerHTML += description;
            const cardFooter = document.createElement('div');
            cardFooter.classList.add(
                'card-footer',
                'small',
                'border-0',
                'bg-transparent'
            );
            //format updated date to mm/dd/yyyy
            let updated = new Date(guide.updated);
            updated = `${updated.getMonth() + 1}/${updated.getDate()}/${updated.getFullYear()}`;
            cardFooter.innerHTML = `updated: ${updated}`;
            card.appendChild(cardFooter);
            list.appendChild(item);
        });

        container.appendChild(heading);
        container.appendChild(list);
    }

    buildCourseList(guides, title = 'Guides') {
        const container = document.querySelector('#libguides');
        const heading = document.createElement('h2');
        const slug = title.toLowerCase().replace(/\s+/g, '-');
        heading.id = slug;
        heading.textContent = title;
        container.appendChild(heading);

        const sectionGuides = guides.map(guide => ({
            ...guide,
            section: guide.name.substring(0, guide.name.indexOf(' '))
                .replace(/[^A-Za-z0-9\s]/g, '')
                .toUpperCase()
        }));

        const groupedGuides = this.groupBy(sectionGuides, 'section');

        for (const [section, items] of Object.entries(groupedGuides)) {
            const anchor = document.createElement('a');
            anchor.className = 'btn btn-link';
            anchor.href = `#${section.toLowerCase()}`;
            anchor.textContent = section;

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'border-left border-secondary pl-3 mb-2';
            const sectionHeading = document.createElement('h3');
            sectionHeading.id = section.toLowerCase();
            sectionHeading.className = 'mt-4 mb-3 h5';
            sectionHeading.textContent = section;
            sectionDiv.appendChild(sectionHeading);

            const ul = document.createElement('ul');
            ul.classList.add('fa-ul');
            items.forEach(guide => {
                let path = guide.redirect_url || guide.friendly_url || guide.url;
                path += `${path.includes('?') ? '&' : '?'}utm_source=www&utm_medium=staff_profile`;
                const li = document.createElement('li');
                li.classList.add('mb-2');
                const icon = document.createElement('span');
                icon.classList.add('fa-li');
                const iconInner = document.createElement('span');
                iconInner.classList.add('fas', 'fa-chalkboard-user');
                icon.appendChild(iconInner);
                const link = document.createElement('a');
                link.className = 'd-block';
                link.href = path;
                link.innerHTML = guide.name;
                link.appendChild(icon);
                li.appendChild(link);
                let updated = new Date(guide.updated);
                updated = `${updated.getMonth() + 1}/${updated.getDate()}/${updated.getFullYear()}`;
                const dateSpan = document.createElement('span');
                dateSpan.classList.add('text-muted', 'small');
                dateSpan.innerHTML = `&mdash;updated: ${updated}`;
                li.appendChild(dateSpan);
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
