import {useLayoutEffect, useEffect, useState} from 'react'
import {Scoped} from './scoped.component.js'
import {styleTags, incrementCounter, transformCss} from './style-element-utils.js'

export function useCss(css, overrideNamespace) {
  const isPostCss = Boolean(css && css.id)
  const namespace = overrideNamespace || (isPostCss && css.namespace) || Scoped.defaultNamespace
  const [styleElement, setStyleElement] = useState(() => getStyleElement(null, isPostCss, css, namespace))
  useStyleElement()

  return {
    [styleElement.kremlingAttr]: String(styleElement.kremlingValue).toString(),
  }

  function useStyleElement() {
    useLayoutEffect(() => {
      const newStyleElement = getStyleElement(styleElement, isPostCss, css, namespace)
      setStyleElement(newStyleElement)

      return () => {
        if (--styleElement.kremlings === 0) {
          document.head.removeChild(styleElement)
          delete styleTags[css]
        }
      }
    }, [css, namespace, styleElement, setStyleElement, isPostCss])
  }
}

function getStyleElement(oldStyleElement, isPostCss, css, namespace) {
  const kremlingAttr = isPostCss ? namespace : `data-${namespace}`
  const kremlingValue = isPostCss ? css.id : incrementCounter()

  let styleElement = isPostCss ? styleTags[css.styles] : styleTags[css]

  if (styleElement) {
    // This css is already being used by another instance of the component, or another component altogether.
    if (styleElement !== oldStyleElement) {
      styleElement.kremlings++
    }
  } else {
    const kremlingSelector = `[${kremlingAttr}='${kremlingValue}']`
    const rawCss = isPostCss ? css.styles : css
    const cssToInsert = isPostCss ? css.styles : transformCss(css, kremlingSelector)

    styleElement = document.createElement('style')
    styleElement.type = 'text/css'
    styleElement.textContent = cssToInsert
    styleElement.kremlings = 1
    styleElement.kremlingAttr = kremlingAttr
    styleElement.kremlingValue = kremlingValue
    document.head.appendChild(styleElement)

    styleTags[rawCss] = styleElement
  }

  return styleElement
}
