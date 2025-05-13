/**
 * Class to load and display RSS feeds using Intersection Observer.
 */
class RSSFeedLoader {
    /**
     * Creates an instance of RSSFeedLoader.
     * @param {Object} config Configuration object for the loader.
     * @param {string} config.url The URL of the RSS feed.
     * @param {number} config.rootMargin Root margin for the Intersection Observer.
     * @param {number} config.numItems Number of items to display.
     * @param {boolean} config.includeThumbnail Whether to include a thumbnail for each item.
     */
    constructor(config) {
        this.config = config;
        this.setupObserver();
    }

    /**
     * Fetches the RSS feed and displays it if the container exists.
     */
    async fetchAndDisplay() {
        const container = document.querySelector(this.config.domInsertionSelector);
        if (!container) return;

        try {
            const response = await fetch(this.config.url);
            const text = await response.text();
            const data = new window.DOMParser().parseFromString(text, "text/xml");
            this.render(data, container);
        } catch (error) {
            console.error('Failed to fetch RSS feed:', error);
            container.style.display = 'none'; // Hide the container on error.
        }
    }

    /**
     * Renders the RSS feed data into the specified container.
     * @param {Document} data XML parsed RSS feed data.
     * @param {Element} container HTML element to insert the data into.
     */
    render(data, container) {
        let items = Array.from(data.querySelectorAll("entry"));
        if (items.length > this.config.numItems) {
            items = this.getRandomItems(items, this.config.numItems);
        }

        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group';

        items.forEach(el => {
            const title = el.querySelector("title").textContent;
            const id = el.querySelector("id").textContent;
            const repository = this.identifyRepository(id);
            const summary = el.querySelector("summary");
            let description = '';

            if (summary) {
                // parse the summary string as html
                const parsedSummary = new DOMParser().parseFromString(summary.textContent, 'text/html');

                const paragraphs = Array.from(parsedSummary.querySelectorAll("p"));
                console.log(paragraphs);

                if (paragraphs.length > 1) {
                    description = paragraphs[1].textContent.replace(/<[^>]*>/g, '').trim();
                    if (description.length > 100) {
                        description = `${description.substring(0, 97).trim()}...`;
                    }
                }
            }

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';

            let img = '';
            if (this.config.includeThumbnail) {
                img = `<img src="${id}/small"
                            alt="Thumbnail for ${title}"
                            class="img-thumbnail img-fluid">`;
            }

            listItem.innerHTML = `
                <div class="row">
                    <div class="d-none d-md-block col-md-6 col-lg-4">${img}</div>
                    <div class="text-secondary col-12 col-md-6 col-lg-8">
                        <h3 class="h6">
                            <a href="${id}">${title}</a>
                        </h3>
                    Form ${repository}: ${description}
                    </div>
                </div>
            `;

            listGroup.appendChild(listItem);
        });

        container.appendChild(listGroup);
    }


    /**
     * Identifies the digital repository based on the item's ID.
     * @param {string} id The item ID.
     * @return {string} The name of the repository.
     */
    identifyRepository(id) {
        if (id.includes('digital.library')) {
            return 'UNT Digital Collections';
        } else if (id.includes('texashistory.unt')) {
            return 'The Portal to Texas History';
        } else if (id.includes('gateway.okhistory')) {
            return 'The Gateway to Oklahoma History';
        }
        return 'Unknown repository';
    }

    /**
     * Gets a random sample of elements from the array.
     * @param {Array} array The array to sample from.
     * @param {number} numItems The number of items to sample.
     * @return {Array} A randomly selected subset of the array.
     */
    getRandomItems(array, numItems) {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numItems);
    }

    /**
     * Sets up an Intersection Observer to trigger data fetching when the insertion point is about to become visible.
     */
    setupObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasFetched) {
                    this.fetchAndDisplay();
                    this.hasFetched = true; // Ensure fetch occurs only once.
                }
            });
        }, {rootMargin: `${this.config.rootMargin}px`}); // Fetch when the element is near the viewport.

        const element = document.querySelector(this.config.domInsertionSelector);
        if (element) {
            observer.observe(element);
        }
    }
}

// Usage example:
const feedLoader = new RSSFeedLoader({
    url: 'https://texashistory.unt.edu/search/feed?t=fulltext&sort=added_d&fq=dc_type%3Atext_newspaper',
    domInsertionSelector: '#feedContainer',
    rootMargin: 200,
    numItems: 5,
    includeThumbnail: true
});
