export class AnchorUtility {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applyAnchors();
        });
    }

    applyAnchors() {
        const headings = document.querySelectorAll('.content h2, .content h3, .content h4, .content h5, .content h6, .content .anchored');
        headings.forEach(heading => {
            // test if heading has and id
            if (!heading.classList.contains('no-toc') && heading.hasAttribute('id') && heading.id !== '' ) {
                const idValue = heading.id;
                const icon = this.createIcon(idValue);
                heading.appendChild(icon);
                //icon.addEventListener('click', () => this.handleIconClick(icon, heading));
            }
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
        link.appendChild(icon);
        return link;
    }


}
