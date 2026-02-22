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
    this.shadowRoot.adoptedStyleSheets = [styles];

    // cloneNode(true) does a deep clone of the template's content.
    // This is cheap — no HTML parsing, just copying existing DOM nodes.
    this.shadowRoot.appendChild(template.content.cloneNode(true));
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
    this.shadowRoot.querySelector('.meta').textContent = `Post #${id} · User ${userId}`;
    this.shadowRoot.querySelector('h3').textContent    = title;
    this.shadowRoot.querySelector('p').textContent     = body;
  }
}

customElements.define('post-card', PostCard);
