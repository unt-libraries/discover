import { onDomReady } from './utils.js';

export class AnchorUtility {
    constructor() {
        this.selectors = '.content h2, .content h3, .content h4, .content h5, .content h6, .content .anchored';
        // autorun
        onDomReady(() => {
            this.init();
        });
    }

    init() {
        const headings = document.querySelectorAll(this.selectors);
        // create the anchor links
        this.makeAnchorLinks(headings);
        // attach the copy to clipboard event listener
        this.copyToCLipBoardListender();
        // add a scroll to top behavior to top of page links
        this.jumptToTopOfPage();
    }

    makeAnchorLinks(headings) {
        headings.forEach(heading => {
            // test if heading has and id
            if (!heading.classList.contains('no-toc') && heading.hasAttribute('id') && heading.id !== '' ) {
                const idValue = heading.id;
                const icon = this.createIcon(idValue);
                heading.appendChild(icon);
            }
        });
    }

    copyToCLipBoardListender() {
        const links = document.querySelectorAll('.anchor-link');
        links.forEach(link => {
            link.addEventListener('click', (event) => {
                //event.preventDefault();
                const url = `${window.location.origin}${window.location.pathname}#${link.href.split('#')[1]}`;
                navigator.clipboard.writeText(url).then(() => {
                    link.setAttribute('data-bs-title', 'Copied to Clipboard');
                }).catch((error) => {
                    console.error('Failed to copy:', error);
                });
            });
        });
    }

    createIcon(idValue) {
        const link = document.createElement('a');
        link.classList.add(
            'anchor-link',
            'ms-2'
        )
        link.href = `#${idValue}`;
        const icon = document.createElement('span');
        icon.className = 'fas fa-link text-secondary-subtle';
        icon.setAttribute('title', 'Update URL to this section');
        link.setAttribute('data-bs-toggle', 'tooltip');
        link.setAttribute('data-bs-title', 'Link to this section');
        link.appendChild(icon);
        return link;
    }

    jumptToTopOfPage(){
        const jumpButtons = document.querySelectorAll(".to-top-btn");
        // for each button add an event listener, prevent default behaviour and scroll to the top of the pages
        jumpButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        });
    }
}
