import { useLayoutEffect, useState } from "react";
import { Scoped } from "./scoped.component.js";
import {
  styleTags,
  incrementCounter,
  transformCss,
} from "./style-element-utils.js";

export function useCss(css, overrideNamespace) {
  const isPreBuiltCss = typeof css === "object";
  if (isPreBuiltCss && !(css.id && typeof css.styles === "string")) {
    throw Error(
      `Kremling's "useCss" hook requires "id" and "styles" properties when using the kremling-loader`,
    );
  }
  const namespace =
    overrideNamespace ||
    (isPreBuiltCss && css.namespace) ||
    Scoped.defaultNamespace;
  const [styleElement, setStyleElement] = useState(() =>
    getStyleElement(isPreBuiltCss, css, namespace),
  );

  useLayoutEffect(() => {
    const newStyleElement = getStyleElement(isPreBuiltCss, css, namespace);
    setStyleElement(newStyleElement);
    newStyleElement.kremlings++;

    return () => {
      if (--styleElement.kremlings === 0) {
        const rawCss = isPreBuiltCss ? css.styles : css;
        document.head.removeChild(styleElement);
        delete styleTags[rawCss];
      }
    };
  }, [css, namespace, isPreBuiltCss]);

  return {
    [styleElement.kremlingAttr]: String(styleElement.kremlingValue).toString(),
  };
}

function getStyleElement(isPreBuiltCss, css, namespace) {
  const kremlingAttr = isPreBuiltCss ? namespace : `data-${namespace}`;
  const kremlingValue = isPreBuiltCss ? css.id : incrementCounter();
  let styleElement = isPreBuiltCss ? styleTags[css.styles] : styleTags[css];

  if (!styleElement) {
    const kremlingSelector = `[${kremlingAttr}='${kremlingValue}']`;
    const rawCss = isPreBuiltCss ? css.styles : css;
    const cssToInsert = isPreBuiltCss
      ? css.styles
      : transformCss(css, kremlingSelector);

    styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = cssToInsert;
    styleElement.kremlings = 0;
    styleElement.kremlingAttr = kremlingAttr;
    styleElement.kremlingValue = kremlingValue;
    document.head.appendChild(styleElement);

    styleTags[rawCss] = styleElement;
  }

  return styleElement;
}
