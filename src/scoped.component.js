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
    if (!props.css && !props.postcss) throw Error(`Kremling's <Scoped /> component requires either the 'css' or 'postcss' props.`);
    if (props.css && props.postcss) throw Error(`Kremling's <Scoped /> component requires either the 'css' or 'postcss' props. Cannot use both.`);
    if (props.postcss && !(props.postcss.styles && props.postcss.id)) throw Error(`Kremlings's <Scoped /> component 'postcss' prop requires an object containing 'styles' and 'id' properties. Try using the kremling-loader.`);
    if (props.css) {
      this.state = this.newCssState(props);
    } else {
      this.state = this.newPostcssState(props);
    }
  }

  render() {
    const kremlingChildren = React.Children.map(this.props.children, child => {
      if (React.isValidElement(child)) {
        let elProps;
        if (this.props.css) {
          elProps = { [this.state.kremlingAttrName]: this.state.kremlingAttrValue };
        } else {
          elProps = { className: `${this.props.postcss.id} ${child.props && child.props.className ? child.props.className : ''}` };
        }
        return React.cloneElement(child, elProps);
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

  componentDidUpdate(prevProps) {
    if (this.props.css) {
      if (this.state.css !== this.props.css) {
        this.doneWithCss();
        this.setState(this.newCssState(this.props))
      }
    } else {
      if (prevProps.postcss.id !== this.props.postcss.id) {
        this.updatePostcssStyle(prevProps.postcss, this.props.postcss);
      }
    }
  }

  componentWillUnmount() {
    if (this.props.css) {
      this.doneWithCss();
    } else {
      this.reducePostcssCounter();
    }
  }

  newCssState(props) {
    if (typeof props.css !== 'string') {
      return;
    }

    if (props.css.indexOf('&') < 0 && props.css.trim().length > 0) {
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

  getPostcssSelector = (id) => {
    return `style_${id.slice(1)}`;
  }

  newPostcssState = (props) => {
    // check if we need to add the style to the head
    let styleRef = document.head.querySelector(`.${this.getPostcssSelector(this.props.postcss.id)}`);
    // there's no style - create a new one and add it to the head
    if (!styleRef) {
      const style = document.createElement('style');
      style.setAttribute('class', this.getPostcssSelector(this.props.postcss.id));
      style.setAttribute('type', 'text/css');
      style.innerHTML = props.postcss.styles;
      style.counter = 1;
      document.head.appendChild(style);
      styleRef = style;
    }
    // there is a style - update the counter property
    else {
      styleRef.counter = styleRef.counter + 1;
    }
    return { styleRef }
  }

  updatePostcssStyle = (oldPostcss, newPostcss) => {
    // check if another component already updated it
    if (!this.state.styleRef.classList.contains(this.getPostcssSelector(newPostcss.id))) {
      this.state.styleRef.classList.replace(
        this.getPostcssSelector(oldPostcss.id),
        this.getPostcssSelector(newPostcss.id)
      );
      this.state.styleRef.innerHTML = newPostcss.styles;  
    }
  }

  reducePostcssCounter = () => {
    this.state.styleRef.counter = this.state.styleRef.counter - 1;
    if (this.state.styleRef.counter === 0) {
      this.state.styleRef.remove();
    }
  }
}

// For tests
export function resetCounter() {
  counter = 0;
}
