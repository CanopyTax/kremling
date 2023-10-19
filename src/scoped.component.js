import React from "react";
import ReactDOM from "react-dom";
import { string, object, oneOfType } from "prop-types";
import {
  styleTags,
  incrementCounter,
  transformCss,
} from "./style-element-utils.js";

const reactSupportsReturningArrays = !!ReactDOM.createPortal;

export class Scoped extends React.Component {
  static propTypes = {
    css: oneOfType([string, object]),
    postcss: object,
    namespace: string,
  };

  static defaultNamespace = "kremling";

  constructor(props) {
    super(props);
    this.state = {};
    if (!props.css)
      throw Error(`Kremling's <Scoped /> component requires the 'css' prop.`);
    if (
      typeof props.css === "object" &&
      (typeof props.css.id !== "string" || typeof props.css.styles !== "string")
    )
      throw Error(
        `Kremling's <Scoped /> component requires either a string or an object with "id" and "styles" properties.`,
      );
    this.state = this.newCssState(props);
  }

  addKremlingAttributeToChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === React.Fragment && React.Fragment) {
          const fragmentChildren = this.addKremlingAttributeToChildren(
            child.props.children,
          );
          return React.cloneElement(child, {}, fragmentChildren);
        } else {
          return React.cloneElement(child, {
            [this.state.kremlingAttr]: this.state.kremlingAttrValue,
          });
        }
      } else {
        return child;
      }
    });
  };

  render() {
    if (
      this.props.children === undefined ||
      this.props.children === null ||
      this.props.children === false ||
      this.props.children === true
    ) {
      return null;
    }

    const kremlingChildren = this.addKremlingAttributeToChildren(
      this.props.children,
    );

    if (reactSupportsReturningArrays) {
      return kremlingChildren;
    } else {
      // React 15 or below
      if (kremlingChildren.length > 1) {
        throw new Error(
          `kremling's <Scoped /> component requires exactly one child element unless you are using react@>=16`,
        );
      } else if (kremlingChildren.length === 1) {
        return kremlingChildren[0];
      } else {
        return null;
      }
    }
  }

  componentDidUpdate(prevProps) {
    const oldCss = prevProps.postcss || prevProps.css;
    const newCss = this.props.postcss || this.props.css;
    if (
      oldCss !== newCss ||
      oldCss.id !== newCss.id ||
      oldCss.styles !== newCss.styles ||
      oldCss.namespace !== newCss.namespace
    ) {
      this.doneWithCss();
      this.setState(this.newCssState(this.props));
    }
  }

  componentWillUnmount() {
    this.doneWithCss();
  }

  doneWithCss = () => {
    if (this.state.styleRef && --this.state.styleRef.kremlings === 0) {
      delete styleTags[this.state.rawCss];
      this.state.styleRef.parentNode.removeChild(this.state.styleRef);
    }
  };

  newCssState(props) {
    const css = props.postcss || props.css;
    const isPostCss = Boolean(css && css.id);
    const namespace =
      (isPostCss ? css.namespace : props.namespace) || Scoped.defaultNamespace;
    const rawCss = isPostCss ? css.styles : css;

    let styleRef, kremlingAttr, kremlingAttrValue;

    if (!isPostCss) {
      if (typeof css !== "string") {
        return;
      }

      if (css.indexOf("&") < 0 && css.trim().length > 0) {
        const firstRule = css.substring(0, props.css.indexOf("{")).trim();
        console.warn(
          `Kremling's <Scoped css="..."> css prop should have the '&' character in it to scope the css classes: ${firstRule}`,
        );
      }
    }

    const existingDomEl = styleTags[rawCss];

    if (existingDomEl) {
      styleRef = existingDomEl;
      existingDomEl.kremlings++;
      kremlingAttr = styleRef.kremlingAttr;
      kremlingAttrValue = styleRef.kremlingValue;
    } else {
      // The attribute for namespacing the css
      kremlingAttr = namespace;
      kremlingAttrValue = isPostCss ? css.id : incrementCounter();

      // The css to append to the dom
      const kremlingSelector = `[${kremlingAttr}="${kremlingAttrValue}"]`;
      const transformedCSS = isPostCss
        ? rawCss
        : transformCss(rawCss, kremlingSelector);

      // The dom element
      const el = document.createElement("style");
      el.setAttribute("type", "text/css");
      el.textContent = transformedCSS;
      el.kremlings = 1;
      el.kremlingAttr = kremlingAttr;
      el.kremlingValue = kremlingAttrValue;
      document.head.appendChild(el);
      styleTags[rawCss] = el;
      styleRef = el;
    }

    return {
      isPostCss,
      rawCss,
      styleRef,
      kremlingAttr,
      kremlingAttrValue,
    };
  }
}
