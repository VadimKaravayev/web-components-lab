const sheet = new CSSStyleSheet();

sheet.replaceSync(`
  :host {
    display: block;
    border: 1px solid var(--card-border-color, #e2e8f0);
    border-radius: var(--card-radius, 8px);
    padding: 1.25rem;
    background: var(--card-bg, #fff);
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
    transition: box-shadow .2s;
  }
  :host(:hover) {
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
  }
  .meta {
    font-size: .75rem;
    color: var(--card-meta-color, #94a3b8);
    margin-bottom: .5rem;
  }
  h3 {
    margin: 0 0 .5rem;
    font-size: 1rem;
    color: var(--card-title-color, #1e293b);
    text-transform: capitalize;
  }
  p {
    margin: 0;
    font-size: .875rem;
    color: var(--card-body-color, #475569);
    line-height: 1.6;
  }
`);

export default sheet;
