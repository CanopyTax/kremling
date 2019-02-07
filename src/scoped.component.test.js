import React from "react";
import ReactDOM from "react-dom";

import { Scoped } from "./scoped.component.js";
import { resetState } from './style-element-utils.js'

describe("<Scoped />", function() {
  beforeEach(() => {
    resetState()
    Array.prototype.slice.call(document.querySelectorAll('style')).forEach(styleElement => {
      console.log('removing')
      styleElement.remove()
    })
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
      [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create local CSS for combined CSS statements & with regular", function() {
    const css = `
      & .someRule, .wow {
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
      [kremling="0"] .someRule, [kremling="0"].someRule, .wow {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create local CSS for combined CSS statements regular with &", function() {
    const css = `
      .wow, & .someRule {
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
      .wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create local CSS for combined CSS statements", function() {
    const css = `
      & .wow, & .someRule {
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
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create local CSS for combined CSS statements and new lines", function() {
    const css = `
      & .wow,
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
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }
    `.trim()
    );

    ReactDOM.unmountComponentAtNode(el);
  });

  it("should create local CSS multiple css statements", function() {
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
      [kremling="0"] .wow, [kremling="0"].wow, [kremling="0"] .someRule, [kremling="0"].someRule {
        background-color: red;
      }

      [kremling="0"] .oliver, [kremling="0"].oliver, [kremling="0"] .cromwell, [kremling="0"].cromwell {
        background-color: green;
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
      [kremling="0"] div, div[kremling="0"] {
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
      [kackle="0"] .someRule, [kackle="0"].someRule {
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

  it("adds Kremling attribute to React Fragment children", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <div id="greeting">Hello</div>
            <div id="farewell">Bye</div>
          </React.Fragment>
        </Scoped>
      </div>,
      el
    );

    expect(el.querySelector("#greeting").getAttribute('kackle')).not.toBe(undefined);
    expect(el.querySelector("#farewell").getAttribute('kackle')).not.toBe(undefined);


    ReactDOM.unmountComponentAtNode(el);
  });

  it("adds Kremling attribute to nested React Fragment children", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <React.Fragment>
              <React.Fragment>
                <div id="greeting">Hello</div>
                <div id="farewell">Bye</div>
              </React.Fragment>
            </React.Fragment>
          </React.Fragment>
        </Scoped>
      </div>,
      el
    );

    expect(el.querySelector("#greeting").getAttribute('kackle')).not.toBe(undefined);
    expect(el.querySelector("#farewell").getAttribute('kackle')).not.toBe(undefined);


    ReactDOM.unmountComponentAtNode(el);
  });

  it("adds Kremling attribute to mixture of React Fragment and DOM Element children", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          <React.Fragment>
            <div id="greeting">Hello</div>
            <div id="farewell">Bye</div>
          </React.Fragment>
          <div id="color">Blue</div>
          <React.Fragment>
            <div id="color2">Green</div>
          </React.Fragment>
        </Scoped>
      </div>,
      el
    );

    expect(el.querySelector("#greeting").getAttribute('kackle')).not.toBe(undefined);
    expect(el.querySelector("#farewell").getAttribute('kackle')).not.toBe(undefined);
    expect(el.querySelector("#color").getAttribute('kackle')).not.toBe(undefined);
    expect(el.querySelector("#color2").getAttribute('kackle')).not.toBe(undefined);

    ReactDOM.unmountComponentAtNode(el);

  });

  it("returns null if child is null", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} namespace="kackle">
          null
        </Scoped>
      </div>,
      el
    );
    expect(el.innerHTML).toBe('<div>null</div>');

    ReactDOM.unmountComponentAtNode(el);

  })

  it("returns null if child is undefined", function() {
    const css = `
      & .someRule {
        background-color: red;
      }
    `;

    const el = document.createElement("div");

    ReactDOM.render(
      <div>
        <Scoped css={css} />
      </div>,
      el
    );
    expect(el.innerHTML).toBe('<div></div>');

    ReactDOM.unmountComponentAtNode(el);
  })

  it("should properly work with dynamically changing css props", function() {
    class Counter extends React.Component {
      state = {width: 100};
      render() {
        return (
          <Scoped css={this.getCSS()}>
            <div id={this.props.id} onClick={this.update.bind(this)}>
              Hello
            </div>
          </Scoped>
        );
      }
      getCSS() {
        return `
            & .someRule {
              width: ${this.state.width}%;
            }
        `;
      }
      update() {
        this.setState({width: this.state.width + 10})
      }
    }

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const el = document.createElement("div");
    document.body.appendChild(el);

    ReactDOM.render(
      <div>
        <Counter id="a" />
        <Counter id="b" />
        <Counter id="c" />
      </div>,
      el
    );

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    el.querySelector('#a').click();
    el.querySelector('#a').click();
    el.querySelector('#b').click();

    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(3);

    ReactDOM.unmountComponentAtNode(el);
    expect(document.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

});
