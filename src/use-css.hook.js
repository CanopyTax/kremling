import {useLayoutEffect, useEffect, useState } from 'react'
import {Scoped} from './scoped.component.js'
import {styleTags, incrementCounter, transformCss} from './style-element-utils.js'

export function useCss(css, overrideNamespace) {
  const isPostCss = typeof css === 'object'
  if (isPostCss && !(css.id && typeof css.styles === 'string')) {
    throw Error(`Kremling's "useCss" hook requires "id" and "styles" properties when using the kremling-loader`)
  }
  const namespace = overrideNamespace || (isPostCss && css.namespace) || Scoped.defaultNamespace
  const [ styleObj, setStyleObj ] = useState(() => {
    const element = getStyleElement(isPostCss, css, namespace, true)
    if (element) {
      return {
        [element.kremlingAttr]: String(element.kremlingValue).toString()
      }
    } else {
      return {}
    }
  })

  useLayoutEffect(
    () => {
      const element = getStyleElement(isPostCss, css, namespace)
      if (element && element.kremlingAttr && element.kremlingValue) {
        setStyleObj({[element.kremlingAttr]: String(element.kremlingValue).toString()})
      }
      return () => maybeRemoveElement(element)
    },
    [css, namespace, isPostCss]
  )

  return styleObj

  function maybeRemoveElement(element) {
    if (--element.kremlings === 0) {
      const rawCss = isPostCss ? css.styles : css
      document.head.removeChild(element)
      delete styleTags[rawCss]
    }
  }

  function getStyleElement (isPostCss, css, namespace, incrementKremlingsIfFound = false) {
    const rawCss = isPostCss ? css.styles : css
    const element = styleTags[rawCss]
    if (element) {
      if (incrementKremlingsIfFound) {
        element.kremlings = element.kremlings + 1
      }
      return element
    } else {
      const kremlingAttr = isPostCss ? namespace : `data-${namespace}`
      const kremlingValue = isPostCss ? css.id : incrementCounter()
      const kremlingSelector = `[${kremlingAttr}='${kremlingValue}']`
      const cssToInsert = isPostCss ? css.styles : transformCss(css, kremlingSelector)
      let styleElement
      // creating a new element
      styleElement = document.createElement('style')
      styleElement.type = 'text/css'
      styleElement.textContent = cssToInsert
      styleElement.kremlings = 1
      styleElement.kremlingAttr = kremlingAttr
      styleElement.kremlingValue = kremlingValue

      const r = document.head.appendChild(styleElement)
      styleTags[rawCss] = r
      return styleElement
    }
  }
}
