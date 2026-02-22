// Type declarations for Lit loaded from CDN.
// Mirrors the public API of lit@3 without requiring an npm install.

declare module 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js' {

  type PropertyValues = Map<PropertyKey, unknown>;

  abstract class LitElement extends HTMLElement {
    static styles?: CSSResultGroup;
    static properties: Record<string, PropertyDeclaration>;

    connectedCallback(): void;
    disconnectedCallback(): void;
    requestUpdate(): void;
    abstract render(): TemplateResult;
    performUpdate(): void | Promise<unknown>;
  }

  interface PropertyDeclaration {
    type?:      typeof String | typeof Number | typeof Boolean | typeof Array | typeof Object;
    attribute?: string | boolean;
    state?:     boolean;
    reflect?:   boolean;
  }

  type CSSResult      = { cssText: string };
  type CSSResultGroup = CSSResult | CSSResult[];

  interface TemplateResult {
    strings: TemplateStringsArray;
    values:  readonly unknown[];
  }

  function html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult;
  function css(strings: TemplateStringsArray,  ...values: unknown[]): CSSResult;
}
