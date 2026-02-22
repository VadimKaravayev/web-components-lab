import styles from './styles.js';

class PostCard extends HTMLElement {
  static get observedAttributes() {
    return ['post-id', 'title', 'body', 'user-id'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
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

    this.shadowRoot.innerHTML = `
      <div class="meta">Post #${id} &nbsp;·&nbsp; User ${userId}</div>
      <h3>${title}</h3>
      <p>${body}</p>
    `;
  }
}

customElements.define('post-card', PostCard);
