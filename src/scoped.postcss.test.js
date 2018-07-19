import React from "react";
import ReactDOM from "react-dom";

import { Scoped } from "./scoped.component.js";

function getSelectorFromId(id) {
  return `style_${id.slice(1)}`
}

describe('<Scoped postcss />', function() {
  beforeEach(() => {
    document.head.innerHTML = '';
  })


  it("should generate and cleanup style tags", function() {
    expect(document.head.querySelectorAll(`style[type="text/css"]`).length).toBe(0);
    const css = {
      id: '.kremling_id_1',
      styles: `.kremling_id_1 .someRule, .kremling_id_1.someRule {background-color: red;}`,
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
      id: '.kremling_id_1',
      styles: `.kremling_id_1 .someRule, .kremling_id_1.someRule {background-color: red;}`,
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
    expect(document.head.querySelector(`.${getSelectorFromId(css.id)}`).innerHTML).toBe(css.styles);
  });


  it('should update <style> tag className and styles on change', function() {
    let css = { id: '.kremling_id_1', styles: `.kremling_id_1 .someRule, .kremling_id_1.someRule {background-color: red;}` };
    const component = (style) => <div><Scoped postcss={style}><div>Hello</div></Scoped></div>;

    const el = document.createElement('div');
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').classList.contains(getSelectorFromId(css.id))).toBe(true);

    // update css
    css = { id: '.kremling_id_2', styles: `.kremling_id_2 .someRule, .kremling_id_2.someRule {background-color: green;}` };
    ReactDOM.render(component(css), el);
    expect(document.head.querySelector('style').classList.contains(getSelectorFromId(css.id))).toBe(true);
  });


  it('should increment/decrement <style> counter when there\'s multiples of the same component', function() {
    const css = { id: '.kremling_id_1', styles: `.kremling_id_1 .someRule, .kremling_id_1.someRule {background-color: red;}` };

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
});