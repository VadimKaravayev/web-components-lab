import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const API   = 'https://jsonplaceholder.typicode.com/posts';
const LIMIT = 10;

class PostsApp extends LitElement {

  // Lit reads this to know which properties trigger a re-render when changed.
  // state: true means internal — no corresponding HTML attribute.
  static properties = {
    _page:       { state: true },
    _totalPages: { state: true },
    _posts:      { state: true },
    _loading:    { state: true },
    _error:      { state: true },
  };

  // Lit's way of defining styles — uses adoptedStyleSheets under the hood.
  // Static so the stylesheet object is shared across all instances.
  static styles = css`
    :host {
      display: block;
      max-width: 780px;
      margin: 0 auto;
      padding: 2rem 1rem;
      font-family: system-ui, sans-serif;
    }
    header { margin-bottom: 1.5rem; }
    h1 {
      margin: 0 0 .25rem;
      font-size: 1.75rem;
      color: #0f172a;
    }
    .subtitle {
      color: #64748b;
      font-size: .875rem;
    }
    ::slotted([slot="heading"]) {
      margin: 0 0 .25rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }
    ::slotted([slot="subheading"]) {
      display: block;
      color: #64748b;
      font-size: .875rem;
    }
    .grid { display: grid; gap: 1rem; }
    .status {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    .error {
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .spinner {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    form {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .75rem;
      padding: 1rem 0;
    }
    label {
      font-size: .875rem;
      color: #475569;
    }
    form button[type="reset"] {
      height: 2.25rem;
      padding: 0 .75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font-size: .875rem;
      cursor: pointer;
    }
    form button[type="reset"]:hover { background: #f1f5f9; }
  `;

  constructor() {
    super();
    this._page       = 1;
    this._totalPages = 1;
    this._posts      = [];
    this._loading    = false;
    this._error      = null;
    this._abortController = null;
  }

  connectedCallback() {
    super.connectedCallback(); // required — Lit does its own setup here
    this.addEventListener('page-change', e => {
      this._page = e.detail.page; // assigning a reactive property schedules a render
      this.#fetchPosts();
    });
    this.#fetchPosts();
  }

  disconnectedCallback() {
    super.disconnectedCallback(); // required
    this._abortController?.abort();
  }

  async #fetchPosts() {
    this._abortController?.abort();
    this._abortController = new AbortController();

    // Lit batches multiple property assignments — only one render is scheduled
    this._loading = true;
    this._error   = null;

    try {
      const url = `${API}?_page=${this._page}&_limit=${LIMIT}`;
      const res  = await fetch(url, { signal: this._abortController.signal });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const total      = parseInt(res.headers.get('X-Total-Count'), 10);
      this._totalPages = Math.ceil(total / LIMIT);
      this._posts      = await res.json();
    } catch (err) {
      if (err.name === 'AbortError') return;
      this._error = err.message;
    } finally {
      this._loading = false;
      // No manual render() call — Lit re-renders automatically when
      // reactive properties change.
    }
  }

  // render() is called by Lit whenever reactive properties change.
  // Returns an html`...` tagged template — Lit diffs it against the
  // previous result and patches only the DOM nodes that actually changed.
  render() {
    return html`
      <header>
        <slot name="heading"><h1>Posts Explorer</h1></slot>
        <slot name="subheading"></slot>
        <span class="subtitle">
          Page ${this._page} of ${this._totalPages} &nbsp;·&nbsp;
          Powered by JSONPlaceholder
        </span>
      </header>

      ${this.#renderBody()}

      <pagination-controls
        current-page=${this._page}
        total-pages=${this._totalPages}>
      </pagination-controls>

      <!-- form is here to demonstrate native form-associated behaviour.
           The browser will call formResetCallback on page-input when reset is clicked. -->
      <form @submit=${e => e.preventDefault()}>
        <label for="page-jump">Jump to page</label>
        <page-input
          id="page-jump"
          name="page"
          max-page=${this._totalPages}>
        </page-input>
        <button type="reset">Reset</button>
      </form>
    `;
  }

  #renderBody() {
    if (this._loading) {
      return html`<div class="status"><div class="spinner"></div></div>`;
    }
    if (this._error) {
      return html`<div class="error">Failed to load posts: ${this._error}</div>`;
    }
    if (!this._posts.length) {
      return html`<div class="status">No posts found.</div>`;
    }

    // html`...` inside .map() — Lit handles arrays of templates natively.
    // No .join('') needed. Values in ${} are always escaped — no XSS risk,
    // no need for the manual #esc() method we had before.
    return html`
      <div class="grid">
        ${this._posts.map(post => html`
          <post-card
            post-id=${post.id}
            user-id=${post.userId}
            title=${post.title}
            body=${post.body}>
          </post-card>
        `)}
      </div>
    `;
  }
}

customElements.define('posts-app', PostsApp);
