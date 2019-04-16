import React from "react";
import ReactDOM from "react-dom";
import {Scoped} from "./scoped.component.js";
import {styleTags} from './style-element-utils.js'
import {resetState} from './style-element-utils.js'

describe('<Scoped postcss />', function() {
  beforeEach(() => {
    resetState()
    Array.prototype.slice.call(document.querySelectorAll('style')).forEach(styleElement => {
      styleElement.remove()
    })
  });

  it("should generate and cleanup style tags", function() {
    expect(document.head.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = {
      id: 1,
      styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}`,
    }
    const el = document.createElement('div');
    ReactDOM.render(
      <Scoped css={css}>
        <div className="crazy">Okay</div>
      </Scoped>,
      el
    );
    expect(document.head.querySelectorAll(`style[type="text/css"]`).length).toBe(1);
    ReactDOM.unmountComponentAtNode(el);
    expect(document.head.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
  });

  it('should create a <style> tag with postcss styles', function() {
    const css = {
      id: 1,
      styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}`,
    }
    const el = document.createElement('div');
    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );
    expect(document.querySelectorAll('style').length).toBe(1)
    expect(document.querySelector('style').textContent).toBe(css.styles);
  });


  it('when webpack updates its styles, component should update the kremling attribute and inner css', function() {
    let css = { id: '1', styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}` };
    const component = (style) => <div><Scoped css={style}><div>Hello</div></Scoped></div>;

    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.querySelector('style').textContent).toBe(css.styles);

    // update css
    css = { id: '2', styles: `[kremling-2] .someRule, [kremling-2].someRule {background-color: green;}` };
    ReactDOM.render(component(css), el);
    expect(document.querySelector('style').textContent).toBe(css.styles);
  });

  it('when the user updates its id, component should update <style> kremling attribute', function() {
    let css = { id: '1', styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}` };
    const component = (style) => <div><Scoped css={style}><div>Hello</div></Scoped></div>;

    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.querySelector('style').textContent).toBe(css.styles);


    // update css
    css = { id: 'custom-id', styles: `[kremling-1] .someRule, [kremling-1].someRule {background-color: red;}` };
    ReactDOM.render(component(css), el);
    expect(document.querySelector('style').textContent).toBe(css.styles);
  });

  it(`should increment/decrement <style> kremlings when there's multiples of the same component`, function() {
    const css = { id: '1', styles: `[kremling="1"] .someRule, [kremling="1"].someRule {background-color: red;}` };

    const el1 = document.createElement('div');
    const el2 = document.createElement('div');

    expect(document.head.querySelectorAll('style').length).toBe(0)

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el1
    );
    expect(document.head.querySelectorAll('style').length).toBe(1)
    expect(document.head.querySelector('style').kremlings).toBe(1);

    ReactDOM.render(
      <div>
        <Scoped css={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el2
    );
    expect(document.head.querySelectorAll('style').length).toBe(1)
    expect(document.head.querySelector('style').kremlings).toBe(2);
    ReactDOM.unmountComponentAtNode(el1);
    expect(document.head.querySelector('style').kremlings).toBe(1);
    ReactDOM.unmountComponentAtNode(el2);
    expect(document.head.querySelector('style')).toBe(null);
  });

  it(`shouldn't throw errors when empty postcss.styles is passed in`, () => {
    const css = { id: '1', styles: '' };
    const component = (style) => <div><Scoped css={style}><div>Hello</div></Scoped></div>;
    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').innerHTML).toEqual('');
  })
});
