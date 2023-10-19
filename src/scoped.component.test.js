import React, { useState } from "react";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { Scoped } from "./scoped.component.js";
import { resetState } from "./style-element-utils.js";

describe("<Scoped />", function () {
  beforeEach(() => {
    resetState();
    Array.prototype.slice
      .call(document.querySelectorAll("style"))
      .forEach((styleElement) => {
        styleElement.remove();
      });
  });

  it("should generate and cleanup style tags", function () {
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const { unmount } = render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);

    unmount();
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  it("should dynamically create a style tag with local CSS", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create local CSS for combined CSS statements & with regular", function () {
    const css = `
      & .someRule, .wow {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] .someRule, [kremling="0"].someRule, .wow {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create local CSS for combined CSS statements regular with &", function () {
    const css = `
      .wow, & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      .wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create local CSS for combined CSS statements", function () {
    const css = `
      & .wow, & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create local CSS for combined CSS statements and new lines", function () {
    const css = `
      & .wow,
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create local CSS multiple css statements", function () {
    const css = `
      & .wow,
      & .someRule {
        background-color: red;
      }

      & .oliver,
      & .cromwell {
        background-color: green;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }

      [kremling="0"] .oliver, [kremling="0"].oliver, [kremling="0"] .cromwell, [kremling="0"].cromwell {
        background-color: green;
      }
    `.trim(),
    );
  });

  it("should dynamically create a style local CSS for non class/id selector", function () {
    const css = `
      & div {
        background-color: pink;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Ahoy hoy</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll('style[type="text/css"]')[0].innerHTML.trim(),
    ).toBe(
      `
      [kremling="0"] div, div[kremling="0"] {
        background-color: pink;
      }
    `.trim(),
    );
  });

  it("should recycle style tags that have the same CSS", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const { unmount } = render(
      <>
        <div>
          <Scoped css={css}>
            <div>Hello</div>
          </Scoped>
        </div>
        <div>
          <Scoped css={css}>
            <div>Hello</div>
          </Scoped>
        </div>
      </>,
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    unmount();
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  it("should dynamically create a style tag with global CSS", function () {
    const css = `
      .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      .someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should create rules with a custom namespace", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css} namespace="kackle">
          <div>Hello</div>
        </Scoped>
      </div>,
    );

    expect(
      document.querySelectorAll(`style[type="text/css"]`)[0].innerHTML.trim(),
    ).toBe(
      `
      [kackle="0"] .someRule, [kackle="0"].someRule {
        background-color: red;
      }
    `.trim(),
    );
  });

  it("should pass through non element children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css} namespace="kackle">
          5
        </Scoped>
      </div>,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("adds Kremling attribute to React Fragment children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <div data-testid="greeting">Hello</div>
            <div data-testid="farewell">Bye</div>
          </React.Fragment>
        </Scoped>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle");
  });

  it("adds Kremling attribute to nested React Fragment children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <React.Fragment>
              <React.Fragment>
                <div data-testid="greeting">Hello</div>
                <div data-testid="farewell">Bye</div>
              </React.Fragment>
            </React.Fragment>
          </React.Fragment>
        </Scoped>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle");
  });

  it("adds Kremling attribute to mixture of React Fragment and DOM Element children", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <div data-testid="greeting">Hello</div>
            <div data-testid="farewell">Bye</div>
          </React.Fragment>
          <div data-testid="color">Blue</div>
          <React.Fragment>
            <div data-testid="color2">Green</div>
          </React.Fragment>
        </Scoped>
      </div>,
    );

    expect(screen.getByTestId("greeting")).toHaveAttribute("kackle");
    expect(screen.getByTestId("farewell")).toHaveAttribute("kackle");
    expect(screen.getByTestId("color")).toHaveAttribute("kackle");
    expect(screen.getByTestId("color2")).toHaveAttribute("kackle");
  });

  it("returns null if child is null", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div data-testid="me">
        <Scoped css={css} namespace="kackle">
          null
        </Scoped>
      </div>,
    );
    expect(screen.getByTestId("me").innerHTML).toBe("null");
  });

  it("returns null if child is undefined", function () {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    render(
      <div data-testid="me">
        <Scoped css={css} />
      </div>,
    );
    expect(screen.getByTestId("me").innerHTML).toEqual("");
  });

  it("should properly work with dynamically changing css props", async () => {
    const user = userEvent.setup();
    const Counter = ({ id }) => {
      const [width, setWidth] = useState(100);
      return (
        <Scoped
          css={`
            & .someRule {
              width: ${width}%;
            }
          `}
        >
          <div onClick={() => setWidth(width + 10)}>{id}</div>
        </Scoped>
      );
    };

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);

    const { unmount } = render(
      <div>
        <Counter id="one" />
        <Counter id="two" />
        <Counter id="three" />
      </div>,
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    user.click(screen.getByText("one"));
    user.click(screen.getByText("one"));
    user.click(screen.getByText("two"));

    await waitFor(() =>
      expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(
        3,
      ),
    );

    unmount();
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });
});
