import React from "react";
import ReactDOM from "react-dom";

import { Scoped } from "./scoped.component.js";

describe("<Scoped />", function() {
  it("should generate and cleanup style tags", function() {
    expect(document.querySelectorAll("style").length).toBe(0);
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
    expect(document.querySelectorAll("style").length).toBe(1);

    ReactDOM.unmountComponentAtNode(el);
    expect(document.querySelectorAll("style").length).toBe(0);
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

    expect(document.querySelectorAll("style")[0].innerHTML.trim()).toBe(
      `
      [data-kremling="1"] .someRule, [data-kremling="1"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
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

    expect(document.querySelectorAll("style")[0].innerHTML.trim()).toBe(
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

    expect(document.querySelectorAll("style")[0].innerHTML.trim()).toBe(
      `
      [data-kackle="3"] .someRule, [data-kackle="3"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });
});
