class PaginationControls extends HTMLElement {
  static get observedAttributes() {
    return ['current-page', 'total-pages'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    this.#render();
  }

  get #currentPage() {
    return parseInt(this.getAttribute('current-page'), 10) || 1;
  }

  get #totalPages() {
    return parseInt(this.getAttribute('total-pages'), 10) || 1;
  }

  #dispatchPageChange(page) {
    this.dispatchEvent(new CustomEvent('page-change', {
      detail: { page },
      bubbles: true,
      composed: true,
    }));
  }

  #render() {
    const current = this.#currentPage;
    const total   = this.#totalPages;
    const pages   = this.#buildPageRange(current, total);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: .5rem;
          padding: 1.5rem 0;
          flex-wrap: wrap;
        }
        button {
          min-width: 2.25rem;
          height: 2.25rem;
          padding: 0 .75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #fff;
          color: #475569;
          font-size: .875rem;
          cursor: pointer;
          transition: background .15s, color .15s;
        }
        button:hover:not(:disabled) {
          background: #f1f5f9;
        }
        button.active {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
          font-weight: 600;
        }
        button:disabled {
          opacity: .4;
          cursor: default;
        }
        .ellipsis {
          color: #94a3b8;
          padding: 0 .25rem;
          line-height: 2.25rem;
        }
      </style>

      <button id="prev" ${current <= 1 ? 'disabled' : ''}>&laquo; Prev</button>

      ${pages.map(p =>
        p === '...'
          ? `<span class="ellipsis">…</span>`
          : `<button class="${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`
      ).join('')}

      <button id="next" ${current >= total ? 'disabled' : ''}>Next &raquo;</button>
    `;

    this.shadowRoot.getElementById('prev')
      ?.addEventListener('click', () => this.#dispatchPageChange(current - 1));

    this.shadowRoot.getElementById('next')
      ?.addEventListener('click', () => this.#dispatchPageChange(current + 1));

    this.shadowRoot.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.#dispatchPageChange(parseInt(btn.dataset.page, 10));
      });
    });
  }

  #buildPageRange(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set([1, total, current, current - 1, current + 1].filter(
      p => p >= 1 && p <= total
    ));
    const sorted = [...pages].sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        result.push('...');
      }
    }
    return result;
  }
}

customElements.define('pagination-controls', PaginationControls);
