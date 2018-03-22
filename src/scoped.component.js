import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const styleTags = {};
let counter = 0;

const reactSupportsReturningArrays = !!ReactDOM.createPortal;

export class Scoped extends React.Component {
  static propTypes = {
    css: PropTypes.string.isRequired,
    namespace: PropTypes.string,
  }

  static defaultNamespace = 'kremling'

  constructor(props) {
    super(props);
    this.state = this.newCssState(props);
  }

  render() {
    const kremlingChildren = React.Children.map(this.props.children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {[this.state.kremlingAttrName]: this.state.kremlingAttrValue});
      } else {
        return child;
      }
    });

    if (reactSupportsReturningArrays) {
      return kremlingChildren;
    } else {
      // React 15 or below
      if (kremlingChildren.length > 1) {
        throw new Error(`kremling's <Scoped /> component requires exactly one child element unless you are using react@>=16`);
      } else if (kremlingChildren.length === 1) {
        return kremlingChildren[0];
      } else {
        return null;
      }
    }
  }

  componentDidUpdate() {
    if (this.state.css !== this.props.css) {
      this.doneWithCss();
      this.setState(this.newCssState(this.props))
    }
  }

  componentWillUnmount() {
    this.doneWithCss();
  }

  newCssState(props) {
    if (typeof props.css !== 'string') {
      return;
    }

    if (props.css.indexOf('&') <= 0) {
      console.warn(`Kremling's <Scoped css="..."> css prop should have the '&' character in it to scope the css classes`);
    }

    let styleRef, kremlingAttrName, kremlingAttrValue;
    const existingDomEl = styleTags[props.css];

    if (existingDomEl) {
      styleRef = existingDomEl;
      existingDomEl.kremlings++;
      kremlingAttrName = styleRef.kremlingAttr;
      kremlingAttrValue = styleRef.kremlingValue;
    } else {
      // The attribute for namespacing the css
      kremlingAttrName = `data-${props.namespace || Scoped.defaultNamespace}`;
      kremlingAttrValue = counter++;

      // The css to append to the dom
      const kremlingSelector = `[${kremlingAttrName}="${kremlingAttrValue}"]`;
      const transformedCSS = props.css.replace(/& (.+){/g, (match, cssRule) => {
        return match
          .split(",") // multiple rules on the same line split by a comma
          .map(cssSplit => {
            cssSplit = cssSplit.trim();

            // ignore css rules that don't begin with '&'
            if (cssSplit.indexOf('&') === -1) return cssSplit.replace('{', '').trim();

            cssSplit = (/[^&](.+)[^{]+/g).exec(cssSplit)[0].trim();

            let builtIn = false;
            if (!/^([.#]\w+)/.test(cssSplit)) {
              builtIn = true;
            }
            // if it's not a built-in selector, prepend the data attribute. Otherwise, append
            return !builtIn
              ? `${kremlingSelector} ${cssSplit}, ${kremlingSelector}${cssSplit}`
              : `${kremlingSelector} ${cssSplit}, ${cssSplit}${kremlingSelector}`;
          })
          .join(", ") + ' {';
      });

      // The dom element
      const el = document.createElement('style');
      el.setAttribute('type', 'text/css');
      el.textContent = transformedCSS;
      el.kremlings = 1;
      el.kremlingAttr = kremlingAttrName;
      el.kremlingValue = kremlingAttrValue;
      document.head.appendChild(el);
      styleTags[props.css] = el;
      styleRef = el;
    }

    return {
      css: props.css,
      styleRef,
      kremlingAttrName,
      kremlingAttrValue,
    };
  }

  doneWithCss = () => {
    if (this.state.styleRef && --this.state.styleRef.kremlings === 0) {
      this.state.styleRef.parentNode.removeChild(this.state.styleRef);
      delete styleTags[this.props.css];
    }
  }
}

// For tests
export function resetCounter() {
  counter = 0;
}
