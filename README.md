# Web Components Lab

A paginated posts explorer built with native Web Components — no frameworks, no build step.

Data is fetched from [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

## Running locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Structure

```
├── index.html
├── components/
│   ├── post-card/                   # vanilla — <template>, Shadow DOM, Constructable Stylesheets
│   │   ├── index.js
│   │   └── styles.js
│   ├── pagination-controls/         # Lit
│   │   └── index.js
│   ├── posts-app/                   # Lit — root component, owns all state
│   │   └── index.js
│   └── page-input/                  # vanilla — form-associated custom element
│       └── index.js
└── lifecycle.md                     # Custom Elements lifecycle reference
```

## Concepts covered

**Vanilla Web Components**
- **Custom Elements** — defining reusable HTML tags with `customElements.define()`
- **Shadow DOM** — encapsulated DOM and style scoping per component
- **`<template>` element** — parsed once, cloned cheaply per instance
- **Constructable Stylesheets** — `CSSStyleSheet` shared across component instances
- **Slots** — projecting light DOM content into shadow DOM with `<slot>`
- **Private class fields** — `#field` syntax for truly private state and methods
- **Custom Events** — loosely coupled component communication via `dispatchEvent` / `addEventListener`
- **AbortController** — cancelling stale in-flight fetches on fast pagination
- **Lifecycle callbacks** — `constructor`, `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`
- **Form-associated custom elements** — `ElementInternals`, `setFormValue`, `setValidity`, `formResetCallback`

**Lit**
- **`LitElement`** — base class that handles rendering, Shadow DOM and styles setup
- **Reactive properties** — `static properties` triggers automatic re-renders on change
- **`html` tagged templates** — efficient DOM diffing, automatic XSS escaping, inline event handlers
- **`css` tagged templates** — scoped styles via `adoptedStyleSheets` under the hood
