const API   = 'https://jsonplaceholder.typicode.com/posts';
const LIMIT = 10; // posts per page

class PostsApp extends HTMLElement {
  // Private fields must be declared at the top of the class body before use
  #page            = 1;
  #totalPages      = 1;
  #posts           = [];
  #loading         = false;
  #error           = null;
  #abortController = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.addEventListener('page-change', e => {
      this.#page = e.detail.page;
      this.#fetchPosts();
    });

    this.#fetchPosts();
  }

  disconnectedCallback() {
    this.#abortController?.abort();
  }

  async #fetchPosts() {
    this.#abortController?.abort();
    this.#abortController = new AbortController();

    this.#loading = true;
    this.#error   = null;
    this.#render();

    try {
      const url = `${API}?_page=${this.#page}&_limit=${LIMIT}`;
      const res = await fetch(url, { signal: this.#abortController.signal });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const total     = parseInt(res.headers.get('X-Total-Count'), 10);
      this.#totalPages = Math.ceil(total / LIMIT);
      this.#posts      = await res.json();
    } catch (err) {
      if (err.name === 'AbortError') return;
      this.#error = err.message;
    } finally {
      this.#loading = false;
      this.#render();
    }
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 780px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: system-ui, sans-serif;
        }
        header {
          margin-bottom: 1.5rem;
        }
        h1 {
          margin: 0 0 .25rem;
          font-size: 1.75rem;
          color: #0f172a;
        }
        .subtitle {
          color: #64748b;
          font-size: .875rem;
        }
        .grid {
          display: grid;
          gap: 1rem;
        }
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
      </style>

      <header>
        <h1>Posts Explorer</h1>
        <span class="subtitle">
          Page ${this.#page} of ${this.#totalPages} &nbsp;·&nbsp;
          Powered by JSONPlaceholder
        </span>
      </header>

      ${this.#renderBody()}

      <pagination-controls
        current-page="${this.#page}"
        total-pages="${this.#totalPages}">
      </pagination-controls>
    `;
  }

  #renderBody() {
    if (this.#loading) {
      return `<div class="status"><div class="spinner"></div></div>`;
    }
    if (this.#error) {
      return `<div class="error">Failed to load posts: ${this.#error}</div>`;
    }
    if (!this.#posts.length) {
      return `<div class="status">No posts found.</div>`;
    }

    const cards = this.#posts.map(post => `
      <post-card
        post-id="${post.id}"
        user-id="${post.userId}"
        title="${this.#esc(post.title)}"
        body="${this.#esc(post.body)}">
      </post-card>
    `).join('');

    return `<div class="grid">${cards}</div>`;
  }

  #esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

customElements.define('posts-app', PostsApp);
