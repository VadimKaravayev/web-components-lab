// @ts-check
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * @typedef {number | '...'} PageItem
 * An item in the page range — either a page number or an ellipsis sentinel.
 */

class PaginationControls extends LitElement {

  static properties = {
    // Lit maps kebab-case attributes to camelCase properties automatically.
    // attribute: 'current-page' tells Lit which HTML attribute to observe.
    currentPage: { type: Number, attribute: 'current-page' },
    totalPages:  { type: Number, attribute: 'total-pages'  },
  };

  static styles = css`
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
    button:hover:not(:disabled) { background: #f1f5f9; }
    button.active {
      background: #3b82f6;
      color: #fff;
      border-color: #3b82f6;
      font-weight: 600;
    }
    button:disabled { opacity: .4; cursor: default; }
    .ellipsis {
      color: #94a3b8;
      padding: 0 .25rem;
      line-height: 2.25rem;
    }
  `;

  constructor() {
    super();
    /** @type {number} */
    this.currentPage = 1;
    /** @type {number} */
    this.totalPages  = 1;
  }

  /**
   * Fires a page-change event that bubbles up through shadow boundaries.
   * @param {number} page
   * @fires CustomEvent<{page: number}>
   */
  #dispatchPageChange(page) {
    this.dispatchEvent(new CustomEvent('page-change', {
      detail: { page },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const { currentPage: current, totalPages: total } = this;
    const pages = this.#buildPageRange(current, total);

    return html`
      <button
        ?disabled=${current <= 1}
        @click=${() => this.#dispatchPageChange(current - 1)}>
        &laquo; Prev
      </button>

      ${pages.map(p => p === '...'
        ? html`<span class="ellipsis">…</span>`
        : html`
            <button
              class=${p === current ? 'active' : ''}
              ?disabled=${p === current}
              @click=${() => this.#dispatchPageChange(p)}>
              ${p}
            </button>
          `
      )}

      <button
        ?disabled=${current >= total}
        @click=${() => this.#dispatchPageChange(current + 1)}>
        Next &raquo;
      </button>
    `;
  }

  /**
   * Builds the visible page range with ellipsis for large page counts.
   * e.g. [1, '...', 4, 5, 6, '...', 10]
   * @param {number} current
   * @param {number} total
   * @returns {PageItem[]}
   */
  #buildPageRange(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set([1, total, current, current - 1, current + 1].filter(
      p => p >= 1 && p <= total
    ));
    const sorted = [...pages].sort((a, b) => a - b);

    /** @type {PageItem[]} */
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
