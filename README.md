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
│   ├── post-card/
│   │   ├── index.js      # <post-card> component
│   │   └── styles.js     # Constructable Stylesheet
│   ├── pagination-controls.js  # <pagination-controls> component
│   └── posts-app.js            # <posts-app> root component
└── lifecycle.md          # Custom Elements lifecycle reference
```

## Concepts covered

- **Custom Elements** — defining reusable HTML tags with `customElements.define()`
- **Shadow DOM** — encapsulated DOM and style scoping per component
- **Constructable Stylesheets** — `CSSStyleSheet` shared across component instances
- **Private class fields** — `#field` syntax for truly private state and methods
- **Custom Events** — loosely coupled communication between components via `dispatchEvent` / `addEventListener`
- **AbortController** — cancelling stale in-flight fetches on fast pagination
- **Lifecycle callbacks** — `constructor`, `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`
