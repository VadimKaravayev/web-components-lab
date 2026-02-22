// @ts-check

const template = document.createElement('template');
template.innerHTML = `
  <input type="number" min="1" part="input" />
  <button type="submit" part="button">Go</button>
`;

class PageInput extends HTMLElement {

  // Opts this element into the form-associated API.
  // Without this, the element is invisible to any <form> it lives in.
  static formAssociated = true;

  constructor() {
    super();
    // Creates a private DOM subtree for this element. Without this,
    // any styles or querySelector calls from the page would reach inside
    // this component, and our internal styles would leak out to the page.
    this.attachShadow({ mode: 'open' });
    /** @type {ShadowRoot} */ (this.shadowRoot).appendChild(template.content.cloneNode(true));

    // ElementInternals is the bridge between the component and its parent form.
    // It gives us: form value submission, validity API, label association.
    this.#internals = this.attachInternals();
  }

  /** @type {ElementInternals} */
  #internals;

  /** @returns {HTMLInputElement} */
  get #input() {
    return /** @type {HTMLInputElement} */ (
      /** @type {ShadowRoot} */ (this.shadowRoot).querySelector('input')
    );
  }

  connectedCallback() {
    this.#applyStyles();

    this.#input.addEventListener('input', () => {
      // Tell the form what value this element contributes to FormData.
      // Works exactly like a native <input name="page"> would.
      this.#internals.setFormValue(this.#input.value);
      this.#validate();
    });

    /** @type {HTMLButtonElement} */ (/** @type {ShadowRoot} */ (this.shadowRoot).querySelector('button')).addEventListener('click', () => {
      this.#submit();
    });

    // Also submit on Enter key inside the input
    this.#input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.#submit();
    });
  }

  // Called by the browser when the element is associated with a form —
  // one of several lifecycle callbacks exclusive to form-associated elements.
  /** @param {HTMLFormElement | null} form */
  formAssociatedCallback(form) {
    // form is the <form> element this component just joined, or null if removed
    console.log('Associated with form:', form);
  }

  // Called when the form is reset — restore default state
  formResetCallback() {
    this.#input.value = '';
    this.#internals.setFormValue('');
    this.#internals.setValidity({});
  }

  // The max page attribute drives validation
  static get observedAttributes() {
    return ['max-page'];
  }

  attributeChangedCallback() {
    const max = parseInt(this.getAttribute('max-page') ?? '0', 10);
    if (max) this.#input.max = String(max);
  }

  #validate() {
    const value  = parseInt(this.#input.value, 10);
    const max    = parseInt(this.getAttribute('max-page') ?? '0', 10) || Infinity;

    if (!this.#input.value) {
      // setValidity(flags, message, anchor)
      // flags: which ValidityState keys are true
      // message: shown by browser on form submit / reportValidity()
      // anchor: the actual input inside shadow DOM to focus on error
      this.#internals.setValidity(
        { valueMissing: true },
        'Please enter a page number',
        this.#input
      );
    } else if (value < 1 || value > max) {
      this.#internals.setValidity(
        { rangeOverflow: true },
        `Page must be between 1 and ${max}`,
        this.#input
      );
    } else {
      // Empty object means valid — clears any existing error
      this.#internals.setValidity({});
    }
  }

  /** @fires CustomEvent<{page: number}> */
  #submit() {
    this.#validate();

    // checkValidity() returns false and fires an 'invalid' event if invalid
    if (!this.#internals.checkValidity()) {
      // reportValidity() additionally shows the browser's native error tooltip
      this.#internals.reportValidity();
      return;
    }

    const page = parseInt(this.#input.value, 10);
    this.dispatchEvent(new CustomEvent('page-change', {
      detail: { page },
      bubbles: true,
      composed: true,
    }));

    this.#input.value = '';
    this.#internals.setFormValue('');
  }

  #applyStyles() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
      }
      input {
        width: 5rem;
        height: 2.25rem;
        padding: 0 .5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: .875rem;
        color: #1e293b;
        text-align: center;
        /* removes browser spinner arrows on number input */
        -moz-appearance: textfield;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button { -webkit-appearance: none; }
      input:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 1px;
        border-color: transparent;
      }
      button {
        height: 2.25rem;
        padding: 0 .75rem;
        border: none;
        border-radius: 6px;
        background: #3b82f6;
        color: #fff;
        font-size: .875rem;
        cursor: pointer;
      }
      button:hover { background: #2563eb; }
    `);
    /** @type {ShadowRoot} */ (this.shadowRoot).adoptedStyleSheets = [sheet];
  }
}

customElements.define('page-input', PageInput);
