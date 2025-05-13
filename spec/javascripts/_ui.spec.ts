import 'bootstrap/js/dist/alert';
import '@testing-library/jest-dom';
import {
  animateSearchIcon,
  bindDismissBannerCookie,
  bindShowAvailMoreField,
  linkify,
  replaceBookCovers,
  hoverHierarchicalLinks,
} from '../../app/frontend/src/javascripts/_ui';

describe('animateSearchIcon', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form class="search-query-form">
        <button type="submit">
          <i class="fa fa-search"></i>
        </button>
      </form>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should replace the search icon with a spinning circle on form submit', () => {
    animateSearchIcon();

    const form = document.querySelector('.search-query-form');
    const buttonIcon = form?.querySelector('.fa-search');

    // Trigger form submit
    form?.dispatchEvent(new Event('submit'));

    expect(buttonIcon).not.toHaveClass('fa-search');
    expect(buttonIcon).toHaveClass('fa-circle-notch');
    expect(buttonIcon).toHaveClass('fa-spin');
  });
});

describe('bindDismissBannerCookie', () => {

});

describe('bindShowAvailMoreField', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-more-scope>
        <div class="more-max d-none">More Content</div>
        <button class="reveal-more">Show More</button>
        <button class="reveal-less d-none">Show Less</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should toggle the visibility of .more-max elements and .reveal-less button on .reveal-more click', () => {
    bindShowAvailMoreField();

    const moreScope: HTMLElement | null = document.querySelector('[data-more-scope]');
    const revealMoreButton: HTMLElement | null | undefined = moreScope?.querySelector('.reveal-more');
    const revealLessButton: HTMLElement | null | undefined = moreScope?.querySelector('.reveal-less');
    const moreMax: HTMLElement | null | undefined = moreScope?.querySelector('.more-max');

    // Trigger click event on the .reveal-more button
    revealMoreButton?.click();

    expect(moreMax).not.toHaveClass('d-none');
    expect(revealMoreButton).toHaveClass('d-none');
    expect(revealLessButton).not.toHaveClass('d-none');

    // Trigger click event on the .reveal-less button
    revealLessButton?.click();

    expect(moreMax).toHaveClass('d-none');
    expect(revealMoreButton).not.toHaveClass('d-none');
    expect(revealLessButton).toHaveClass('d-none');
  });
});

describe('linkify', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="linkify-text" id="url-text">
        Visit https://example.com or contact us at info@example.com
        Test a period at the end of a URL: https://example.com.
      </div>
      <div class="linkify-text" id="email-text">
        Visit https://unt.edu or contact us at info@unt.edu
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should convert multiple links and emails in .linkify-text elements', () => {
    linkify();

    const links = document.querySelectorAll('a.textLink');
    expect(links.length).toBe(5);
  });

  it('should convert URLs into clickable links', () => {
    linkify();

    const urlLink = document.querySelector('a.textLink');
    expect(urlLink).toHaveAttribute('href', 'https://example.com');
    expect(urlLink).toHaveTextContent('https://example.com');
  });

  it('should convert email addresses into clickable links', () => {
    linkify();

    const links = document.querySelectorAll('a.emailLink');
    expect(links.length).toBe(2);

    const emailLink = document.querySelector('a.emailLink');
    expect(emailLink).toHaveAttribute('href', 'mailto:info@example.com');
    expect(emailLink).toHaveTextContent('info@example.com');
  });
});

describe('hoverHierarchicalLinks', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Set up your DOM here
    container = document.createElement('div');
    container.innerHTML = `
      <div class="show-document">
        <div class="result__value__row hierarchical-link">
          <span>Level 1</span>
          <a href="#">Link 1</a>
        </div>
        <div class="result__value__row hierarchical-link">
          <span>Level 2</span>
          <a href="#">Link 2</a>
        </div>
        <div class="result__value__row hierarchical-link">
          <span>Level 3</span>
          <a href="#">Link 3</a>
        </div>
      </div>
    `;
    document.body.appendChild(container);
    hoverHierarchicalLinks();
  });

  afterEach(() => {
    // Clean up your DOM here
    document.body.removeChild(container);
  });

  it('should add hover effects to previous siblings of hierarchical links', () => {
    const links = container.querySelectorAll('.hierarchical-link a');

    links.forEach((link) => {
      // Trigger hover event
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      link.dispatchEvent(mouseEnterEvent);

      // Check if the hover effect is applied to previous siblings
      let prevSibling = link.previousElementSibling;
      while (prevSibling) {
        expect(prevSibling.classList.contains('hover')).toBe(true);
        prevSibling = prevSibling.previousElementSibling;
      }

      // Trigger mouseout event
      const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      link.dispatchEvent(mouseLeaveEvent);

      // Check if the hover effect is removed from previous siblings
      prevSibling = link.previousElementSibling;
      while (prevSibling) {
        expect(prevSibling.classList.contains('hover')).toBe(false);
        prevSibling = prevSibling.previousElementSibling;
      }
    });
  });
});
