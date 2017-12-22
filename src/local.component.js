import React from 'react';
import PropTypes from 'prop-types';

const styleTags = {};
let counter = 0;

export class Local extends React.Component {
  static propTypes = {
    css: PropTypes.string.isRequired,
    namespace: PropTypes.string,
  }
  static defaultNamespace = 'kremling';
  constructor(props) {
    super(props);
    if (typeof props.css === 'string') {
      if (props.css.indexOf('&') <= 0) {
        console.warn(`Kremling's <Local css="..."> css prop should have the '&' character in it to locally scope css classes`);
      }
      const existingDomEl = styleTags[props.css];
      if (existingDomEl) {
        this.styleRef = existingDomEl;
        existingDomEl.kremlings++;
      } else {
        // The attribute for namespacing the css
        this.kremlingAttrName = `data-${props.namespace || Local.defaultNamespace}`;
        this.kremlingAttrValue = counter++;

        // The css to append to the dom
        const kremlingSelector = `[${this.kremlingAttrName}="${this.kremlingAttrValue}"]`;
        const transformedCSS = props.css.replace(/& (.+){/, (match, cssRule) => {
          cssRule = cssRule.trim();
          return `${kremlingSelector} ${cssRule}, ${kremlingSelector}${cssRule} {`;
        });

        // The dom element
        const el = document.createElement('style');
        el.setAttribute('type', 'text/css');
        el.textContent = transformedCSS;
        el.kremlings = 1;
        el.kremlingAttr = kremlingSelector;
        document.head.appendChild(el);
        styleTags[props.css] = el;
        this.styleRef = existingDomEl;
      }
    }
  }
  render() {
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {[this.kremlingAttrName]: this.kremlingAttrValue});
      } else {
        return child;
      }
    });
  }
  componentWillUnmount() {
    if (--this.styleRef.kremlings === 0) {
      this.styleRef.parentNode.removeChild(this.styleRef);
      delete styleTags[this.props.css];
    }
  }
}
