import React from "react";
import { render, screen } from "@testing-library/react";

import { useCss } from "./use-css.hook.js";
import { resetState, styleTags } from "./style-element-utils.js";

let numRenders = 0;

describe("useCss()", () => {
  let container;

  beforeEach(() => {
    resetState();
    container = document.createElement("div");
    numRenders = 0;
    const styleElements = document.querySelectorAll("style");
    Array.prototype.slice
      .call(document.querySelectorAll("style"))
      .forEach((styleElement) => {
        styleElement.remove();
      });
  });

  it("returns the correct props for a dom react element", () => {
    const css = `& .foo {}`;

    render(<ScopedDiv css={css} />);
    expect(screen.getByText("hi")).toHaveAttribute("data-kremling", "0");
  });

  it("creates a <style> element when mounting new css, and removes the <style> element when unmounting the component", () => {
    const css = `& .foo {}`;
    const { unmount } = render(<ScopedDiv css={css} />);

    const styleElement = document.querySelector("style");
    expect(styleElement).not.toBeUndefined();
    expect(styleElement.textContent).toEqual(
      `[data-kremling='0'] .foo, [data-kremling='0'].foo {}`,
    );
    expect(styleElement.isConnected).toBe(true);
    unmount();
    expect(styleElement.isConnected).toBe(false);
  });

  it("reuses an existing style element from a different instance or component", () => {
    const css = `& .foo {}`;
    const existingStyleElement = document.createElement("style");
    existingStyleElement.type = "text/css";
    existingStyleElement.textContent = `[data-kremling='4'] .foo, [data-kremling='4'].foo {}`;
    existingStyleElement.kremlings = 1;
    existingStyleElement.kremlingAttr = "data-kremling";
    existingStyleElement.kremlingValue = 4;
    document.head.appendChild(existingStyleElement);
    styleTags[css] = existingStyleElement;

    const { unmount } = render(<ScopedDiv css={css} />);
    expect(document.querySelectorAll("style").length).toBe(1);
    expect(document.querySelector("style")).toBe(existingStyleElement);
    expect(screen.getByText("hi")).toHaveAttribute("data-kremling", "4");
    // The style element is in the dom
    expect(existingStyleElement.isConnected).toBe(true);
    expect(existingStyleElement.kremlings).toBe(2);
    unmount();
    // The style element is still in the dom because there was a previous thing using it
    expect(existingStyleElement.isConnected).toBe(true);
    expect(existingStyleElement.kremlings).toBe(1);
  });

  it(`doesn't cause the component to render more than once`, () => {
    const css = `& .foo {}`;
    render(<ScopedDiv css={css} />);
    expect(numRenders).toBe(1);
  });

  it(`doesn't do anything weird on subsequent renders`, () => {
    const css = `& .foo {}`;
    const { rerender } = render(<ScopedDiv css={css} />, container);
    expect(document.querySelectorAll("style").length).toBe(1);
    let styleElement = document.querySelector("style");
    expect(styleElement.kremlings).toBe(1);
    expect(styleElement.kremlingAttr).toBe("data-kremling");
    expect(styleElement.kremlingValue).toBe(0);

    // Subsequent render
    rerender(<ScopedDiv css={css} />);
    expect(document.querySelectorAll("style").length).toBe(1);
    styleElement = document.querySelector("style");
    expect(styleElement.kremlings).toBe(1);
    expect(styleElement.kremlingAttr).toBe("data-kremling");
    expect(styleElement.kremlingValue).toBe(0);
  });

  it(`allows you to change the dom attribute with a namespace argument`, () => {
    const css = `& .foo {}`;

    render(<ScopedDiv css={css} namespace="yoshi" />);
    expect(screen.getByText("hi")).toHaveAttribute("data-yoshi", "0");
  });

  it(`works with postcss`, () => {
    const postcss = {
      id: "15",
      styles: `[donkey-kong='15'] .foo, [donkey-kong='15'].foo {}`,
      namespace: "donkey-kong",
    };

    render(<ScopedDiv css={postcss} />, container);
    expect(screen.getByText("hi")).toHaveAttribute("donkey-kong", "15");
  });

  it(`postcss should accept empty style strings`, () => {
    const postcss = {
      id: "15",
      styles: ``,
      namespace: "donkey-kong",
    };

    render(<ScopedDiv css={postcss} />);
    expect(screen.getByText("hi")).toHaveAttribute("donkey-kong", "15");
  });

  it(`removes the local styleTag references when the component is unmounted`, () => {
    const postcss = {
      id: "8",
      styles: `[star-wars='8'] .kenobi, [star-wars='8'].kenobi{}`,
      namespace: "star-wars",
    };

    const { unmount } = render(<ScopedDiv css={postcss} />);
    expect(screen.getByText("hi")).toHaveAttribute("star-wars", "8");
    expect(styleTags[postcss.styles]).toBeDefined();
    unmount();
    expect(styleTags[postcss.styles]).toBeUndefined();
  });
});

function ScopedDiv(props) {
  const scope = useCss(props.css, props.namespace);

  numRenders++;

  return <div {...scope}>hi</div>;
}
