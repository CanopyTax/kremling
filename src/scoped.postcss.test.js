import React from "react";
import ReactDOM from "react-dom";
import { Scoped } from "./scoped.component.js";

describe('<Scoped postcss />', function() {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it("should generate and cleanup style tags", function() {
    expect(document.head.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = {
      id: 1,
      styles: `[data-kremling="1"] .someRule, [data-kremling="1"].someRule {background-color: red;}`,
    }
    const el = document.createElement('div');
    ReactDOM.render(
      <Scoped postcss={css}>
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
      styles: `[data-kremling="1"] .someRule, [data-kremling="1"].someRule {background-color: red;}`,
    }
    const el = document.createElement('div');
    ReactDOM.render(
      <div>
        <Scoped postcss={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el
    );
    expect(document.head.querySelector(`[data-kremling="${css.id}"]`).innerHTML).toBe(css.styles);
  });


  it('when webpack updates its styles, component should update the data-kremling attribute and inner css', function() {
    let css = { id: '1', styles: `[data-kremling-1] .someRule, [data-kremling-1].someRule {background-color: red;}` };
    const component = (style) => <div><Scoped postcss={style}><div>Hello</div></Scoped></div>;

    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').getAttribute('data-kremling')).toBe('1');

    // update css
    css = { id: '2', styles: `[data-kremling-2] .someRule, [data-kremling-2].someRule {background-color: green;}` };
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').getAttribute('data-kremling')).toBe('2');
  });

  it('when the user updates its id, component should update <style> data-kremling attribute', function() {
    let css = { id: '1', styles: `[data-kremling-1] .someRule, [data-kremling-1].someRule {background-color: red;}` };
    const component = (style) => <div><Scoped postcss={style}><div>Hello</div></Scoped></div>;
  
    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').getAttribute('data-kremling')).toBe('1');
  
    // update css
    css = { id: 'custom-id', styles: `[data-kremling-1] .someRule, [data-kremling-1].someRule {background-color: red;}` };
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').getAttribute('data-kremling')).toBe('custom-id');
  });
  
  it('should increment/decrement <style> counter when there\'s multiples of the same component', function() {
    const css = { id: '1', styles: `[data-kremling="1"] .someRule, [data-kremling="1"].someRule {background-color: red;}` };
  
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
  
    ReactDOM.render(
      <div>
        <Scoped postcss={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el1
    );
    expect(document.head.querySelector('style').counter).toBe(1);
  
    ReactDOM.render(
      <div>
        <Scoped postcss={css}>
          <div>Hello</div>
        </Scoped>
      </div>,
      el2
    );
    expect(document.head.querySelector('style').counter).toBe(2);
    ReactDOM.unmountComponentAtNode(el1);
    expect(document.head.querySelector('style').counter).toBe(1);
    ReactDOM.unmountComponentAtNode(el2);
    expect(document.head.querySelector('style')).toBe(null);
  });

  it(`shouldn't throw errors when empty postcss.styles is passed in`, () => {
    const css = { id: '1', styles: '' };
    const component = (style) => <div><Scoped postcss={style}><div>Hello</div></Scoped></div>;
    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').innerHTML).toEqual('');
  })
});