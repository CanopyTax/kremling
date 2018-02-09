import React from "react";
import ReactDOM from "react-dom";

import { Scoped, resetCounter } from "./scoped.component.js";

describe("<Scoped />", function() {
  beforeEach(() => {
    resetCounter()
  })

  it("should generate and cleanup style tags", function() {
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);

    ReactDOM.unmountComponentAtNode(el);
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  it("should dynamically create a style tag with local CSS", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );

    expect(document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim()).toBe(
      `
      [data-kremling="0"] .someRule, [data-kremling="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should dynamically create a style local CSS for non class/id selector", function() {
    const css = `
      & div {
        background-color: pink;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Ahoy hoy</div>
        </Scoped>
      </div>,
      el
    );

    expect(document.querySelectorAll('style[type="text/css"]')[0].innerHTML.trim()).toBe(
      `
      [data-kremling="0"] div, div[data-kremling="0"] {
        background-color: pink;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should recycle style tags that have the same CSS", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el1 = document.createElement("div");
    const el2 = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el1
    );

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el2
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    ReactDOM.unmountComponentAtNode(el1);
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    ReactDOM.unmountComponentAtNode(el2);
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  it("should dynamically create a style tag with global CSS", function() {
    const css = `
      .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );

    expect(document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim()).toBe(
      `
      .someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create rules with a custom namespace", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );

    expect(document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim()).toBe(
      `
      [data-kackle="0"] .someRule, [data-kackle="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should pass through non element children", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          5
        </Scoped>
      </div>,
      el
    );

    expect(el.innerHTML).toBe('<div>5</div>')

    ReactDOM.unmountComponentAtNode(el);
  });
});
