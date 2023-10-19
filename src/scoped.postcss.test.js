import React from "react";
import { render } from "@testing-library/react";

import { Scoped } from "./scoped.component.js";
import { resetState } from "./style-element-utils.js";

describe("<Scoped postcss />", function () {
  beforeEach(() => {
    resetState();
    Array.prototype.slice
      .call(document.querySelectorAll("style"))
      .forEach((styleElement) => {
        styleElement.remove();
      });
  });

  it("should generate and cleanup style tags", function () {
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(0);
    const css = {
      id: "1",
      styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}`,
    };
    const app = render(
      <Scoped css={css}>
        <div className="crazy">Okay</div>
      </Scoped>,
    );
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(1);
    app.unmount();
    expect(
      document.head.querySelectorAll(`style[type="text/css"]`).length,
    ).toBe(0);
  });

  it("should create a <style> tag with postcss styles", function () {
    const css = {
      id: "1",
      styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}`,
    };
    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );
    expect(document.querySelectorAll("style").length).toBe(1);
    expect(document.querySelector("style").textContent).toBe(css.styles);
  });

  it("when webpack updates its styles, component should update the kremling attribute and inner css", function () {
    let css = {
      id: "1",
      styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}`,
    };
    const Component = ({ kremlingCss }) => (
      <div>
        <Scoped css={kremlingCss}>
          <div>Hello</div>
        </Scoped>
      </div>
    );

    const { rerender } = render(<Component kremlingCss={css} />);
    expect(document.querySelector("style").textContent).toBe(css.styles);

    // update css
    css = {
      id: "2",
      styles: `[kremling-2] .someRule, [kremling-2].someRule {background-color: green;}`,
    };
    rerender(<Component kremlingCss={css} />);
    expect(document.querySelector("style").textContent).toBe(css.styles);
  });

  it("when the user updates its id, component should update <style> kremling attribute", function () {
    let css = {
      id: "1",
      styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}`,
    };
    const Component = ({ kremlingCss }) => (
      <div>
        <Scoped css={kremlingCss}>
          <div>Hello</div>
        </Scoped>
      </div>
    );

    const { rerender } = render(<Component kremlingCss={css} />);
    expect(document.querySelector("style").textContent).toBe(css.styles);

    // update css
    css = {
      id: "custom-id",
      styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}`,
    };
    rerender(<Component kremlingCss={css} />);
    expect(document.querySelector("style").textContent).toBe(css.styles);
  });

  it(`should increment/decrement <style> kremlings when there's multiples of the same component`, function () {
    const css = {
      id: "1",
      styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}`,
    };

    expect(document.head.querySelectorAll("style").length).toBe(0);

    const Component = () => (
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>
    );

    const { rerender, unmount } = render(
      <>
        <Component />
      </>,
    );

    expect(document.head.querySelectorAll("style").length).toBe(1);
    expect(document.head.querySelector("style").kremlings).toBe(1);

    rerender(
      <>
        <Component />
        <Component />
      </>,
    );
    expect(document.head.querySelectorAll("style").length).toBe(1);
    expect(document.head.querySelector("style").kremlings).toBe(2);

    unmount();
    expect(document.head.querySelector("style")).toBe(null);
  });

  it(`shouldn't throw errors when empty postcss.styles is passed in`, () => {
    const css = { id: "1", styles: "" };
    const Component = ({ kremlingCss }) => (
      <div>
        <Scoped css={kremlingCss}>
          <div>Hello</div>
        </Scoped>
      </div>
    );
    render(<Component kremlingCss={css} />);
    expect(document.head.querySelector("style").innerHTML).toEqual("");
  });
});
