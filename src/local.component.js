import React from 'react';
import PropTypes from 'prop-types';

const styleTags = {};
let counter = 0;

export class Local extends React.Component {
  static propTypes = {
    css: PropTypes.string.isRequired,
  }
  static defaultTagname = 'div';
  static defaultNamespace = 'kremling';
  constructor(props) {
    super(props);
    if (typeof props.css === 'string') {
      const existingDomEl = styleTags[props.css];
      if (existingDomEl) {
        this.styleRef = existingDomEl;
        existingDomEl.kremlings++;
      } else {
        // The attribute for namespacing the css
        this.kremlingAttrName = `data-${props.namespace || Local.defaultNamespace}`;
        this.kremlingAttrValue = counter++;

        // The css to append to the dom
        const cssSelector = `[${this.kremlingAttrName}="${this.kremlingAttrValue}"]`;
        const transformedCSS = props.css.replace('&', cssSelector);

        // The dom element
        const el = document.createElement('style');
        el.textContent = transformedCSS;
        el.kremlings = 1;
        el.kremlingAttr = cssSelector;
        document.head.appendChild(el);
        styleTags[props.css] = el;
        this.styleRef = existingDomEl;
      }
    }
  }
  render() {
    return React.createElement(this.props.tagName || Local.defaultTagname, {[this.kremlingAttrName]: this.kremlingAttrValue}, this.props.children);
  }
  componentWillUnmount() {
    if (--this.styleRef.kremlings === 0) {
      this.styleRef.parentNode.removeChild(this.styleRef);
      delete styleTags[this.props.css];
    }
  }
}
