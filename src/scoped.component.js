import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const styleTags = {};
let counter = 0;

const reactSupportsReturningArrays = !!ReactDOM.createPortal;

export class Scoped extends React.Component {
  static propTypes = {
    css: PropTypes.string,
    postcss: PropTypes.object,
    namespace: PropTypes.string,
  }

  static defaultNamespace = 'kremling'

  constructor(props) {
    super(props);
    this.state = {};
    if (!props.css && !props.postcss) throw Error(`Kremling's <Scoped /> component requires either the 'css' or 'postcss' props.`);
    if (props.css && props.postcss) throw Error(`Kremling's <Scoped /> component requires either the 'css' or 'postcss' props. Cannot use both.`);
    if (props.postcss && !(typeof props.postcss.styles === 'string' && props.postcss.id)) throw Error(`Kremlings's <Scoped /> component 'postcss' prop requires an object containing 'styles' and 'id' properties. Try using the kremling-loader.`);
    if (props.css) {
      this.state = this.newCssState(props);
    } else {
      this.state = this.newPostcssState(props);
    }
  }

  addKremlingAttributeToChildren = (children) => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        if (child.type === React.Fragment && React.Fragment) {
          const fragmentChildren = this.addKremlingAttributeToChildren(child.props.children);
          return React.cloneElement(child, {}, fragmentChildren);
        } else {
          return React.cloneElement(child, {[this.state.kremlingAttrName]: this.state.kremlingAttrValue});
        }
      } else {
        return child;
      }
    });
  }

  render() {
    const kremlingChildren = this.addKremlingAttributeToChildren(this.props.children);

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

  componentDidUpdate(prevProps) {
    if (this.props.css) {
      if (this.state.css !== this.props.css) {
        this.doneWithCss();
        this.setState(this.newCssState(this.props))
      }
    } else {
      if (prevProps.postcss.id !== this.props.postcss.id
        || prevProps.postcss.styles !== this.props.postcss.styles
        || prevProps.postcss.namespace !== this.props.postcss.namespace) {
        this.doneWithPostcss();
        this.setState(this.newPostcssState(this.props));
      }
    }
  }

  componentWillUnmount() {
    if (this.props.css) {
      this.doneWithCss();
    } else {
      this.doneWithPostcss();
    }
  }

  newCssState(props) {
    if (typeof props.css !== 'string') {
      return;
    }

    if (props.css.indexOf("&") < 0 && props.css.trim().length > 0) {
      const firstRule = props.css.substring(0, props.css.indexOf("{")).trim();
      console.warn(
        `Kremling's <Scoped css="..."> css prop should have the '&' character in it to scope the css classes: ${firstRule}`
      );
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
      const transformedCSS = props.css.replace(/& ([^{}])+{/g, (match, cssRule) => {
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

  doneWithPostcss = () => {
    this.state.styleRef.counter -= 1;
    if (this.state.styleRef.counter === 0) {
      this.state.styleRef.parentNode.removeChild(this.state.styleRef);
    }
  }

  newPostcssState = (props) => {
    const kremlingAttrName = props.postcss.namespace || 'data-kremling';
    const kremlingAttrValue = props.postcss.id;
    let styleRef = this.state.styleRef || document.head.querySelector(`[${kremlingAttrName}="${kremlingAttrValue}"]`);
    if (!styleRef) {
      styleRef = document.createElement('style');
      styleRef.setAttribute('type', 'text/css');
      styleRef.counter = 1;
    } else {
      styleRef.counter += 1;
    }
    styleRef.setAttribute(kremlingAttrName, kremlingAttrValue);
    styleRef.innerHTML = props.postcss.styles;
    document.head.appendChild(styleRef);
    return {
      kremlingAttrName,
      kremlingAttrValue,
      styleRef
    }
  }

}

// For tests
export function resetCounter() {
  counter = 0;
}
