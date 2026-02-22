// @ts-check
import styles from './styles.js';

// The template is created once at module level — outside the class.
// Every instance clones from this single parsed structure.
const template = document.createElement('template');
template.innerHTML = `
  <div class="meta"></div>
  <h3></h3>
  <p></p>
`;

class PostCard extends HTMLElement {
  static get observedAttributes() {
    return ['post-id', 'title', 'body', 'user-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // shadowRoot is guaranteed non-null after attachShadow — cast to silence TS.
    const root = /** @type {ShadowRoot} */ (this.shadowRoot);
    root.adoptedStyleSheets = [styles];

    // cloneNode(true) does a deep clone of the template's content.
    // This is cheap — no HTML parsing, just copying existing DOM nodes.
    root.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  #render() {
    const id     = this.getAttribute('post-id') ?? '?';
    const title  = this.getAttribute('title')   ?? '';
    const body   = this.getAttribute('body')    ?? '';
    const userId = this.getAttribute('user-id') ?? '?';

    // Instead of rebuilding the DOM, we just update the text of existing nodes.
    // textContent is safe — no HTML parsing, no XSS risk.
    const root = /** @type {ShadowRoot} */ (this.shadowRoot);

    // These elements are guaranteed to exist — cloned from the template above.
    /** @type {HTMLElement} */ (root.querySelector('.meta')).textContent = `Post #${id} · User ${userId}`;
    /** @type {HTMLElement} */ (root.querySelector('h3')).textContent    = title;
    /** @type {HTMLElement} */ (root.querySelector('p')).textContent     = body;
  }
}

customElements.define('post-card', PostCard);
