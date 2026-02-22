# Custom Elements Lifecycle

There are four lifecycle callbacks in the Custom Elements spec.

## 1. `constructor()`

Called when the element is **created** — either by the parser hitting the tag in HTML, or by `document.createElement('post-card')`.

```js
constructor() {
  super();                          // always required first
  this.attachShadow({ mode: 'open' });
  // safe: set up shadow root, attach event listeners, init properties
  // unsafe: read attributes, access children — they don't exist yet
}
```

The element exists in memory but is not in the document yet.

---

## 2. `connectedCallback()`

Called when the element is **inserted into the document** (or moved to a new parent).

```js
connectedCallback() {
  this.fetchPosts();   // safe to fetch, render, read attributes
}
```

This is where you start work — fetch data, render, set up timers, subscribe to events. Can be called multiple times if the element is moved around the DOM.

---

## 3. `disconnectedCallback()`

Called when the element is **removed from the document**.

```js
disconnectedCallback() {
  clearInterval(this._timer);
  this._abortController.abort();  // cancel in-flight fetch
}
```

The cleanup mirror of `connectedCallback`. If an element is removed while a fetch is in flight, that fetch will still try to call `render()` on a detached element. The right fix:

```js
connectedCallback() {
  this._abortController = new AbortController();
  this.fetchPosts();
}

disconnectedCallback() {
  this._abortController.abort();
}

async fetchPosts() {
  const res = await fetch(url, { signal: this._abortController.signal });
  // if aborted, fetch throws — caught by try/catch, no render
}
```

---

## 4. `attributeChangedCallback(name, oldValue, newValue)`

Called when an **observed attribute** changes. Only fires for attributes listed in `observedAttributes`.

```js
static get observedAttributes() {
  return ['current-page', 'total-pages'];
}

attributeChangedCallback(name, oldValue, newValue) {
  if (oldValue === newValue) return;  // guard against no-op changes
  this.render();
}
```

`name` tells you which attribute changed — useful when different attributes need different responses:

```js
attributeChangedCallback(name, oldValue, newValue) {
  if (name === 'total-pages') this.recalculate();
  if (name === 'current-page') this.render();
}
```

---

## 5. `adoptedCallback()`

Called when the element is **moved to a different document** — e.g. into an `<iframe>`'s document via `adoptNode()`.

```js
adoptedCallback() {
  // re-initialize anything document-specific
}
```

Rare in practice. Mostly relevant for drag-and-drop between frames or advanced editor tooling.

---

## Lifecycle Order

```
constructor()               element created in memory
      ↓
attributeChangedCallback()  if attributes were set in HTML before upgrade
      ↓
connectedCallback()         element added to document
      ↓
attributeChangedCallback()  any time an attribute changes after that
      ↓
disconnectedCallback()      element removed from document
```

> **Note:** `attributeChangedCallback` fires before `connectedCallback` if attributes
> were set in HTML before the element upgraded. This means `this.shadowRoot` may not
> exist yet if you set it up in `connectedCallback` rather than the `constructor`.
> Always call `attachShadow` in the `constructor`.
