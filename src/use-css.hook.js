import {useLayoutEffect, useState} from 'react'
import {Scoped} from './scoped.component.js'
import {styleTags, incrementCounter, getCurrentCounter, transformCss} from './style-element-utils.js'

export function useCss(css, overrideNamespace) {
  const [kremlingId, setKremlingId] = useState(getCurrentCounter())
  const isPostCss = css && css.id && css.styles
  const namespace = overrideNamespace || (isPostCss && css.namespace) || Scoped.defaultNamespace
  const kremlingAttrName = isPostCss ? namespace : `data-${namespace}`

  useStyleElement()

  return {
    [kremlingAttrName]: String(kremlingId).toString(),
  }

  function useStyleElement() {
    useLayoutEffect(() => {
      let styleElement = isPostCss ? document.head.querySelector(`[${kremlingAttrName}='${kremlingId}']`) : styleTags[css]

      if (!styleElement) {
        const newKremlingId = isPostCss ? css.id : incrementCounter()
        const kremlingSelector = `[${kremlingAttrName}='${newKremlingId}']`
        const rawCss = isPostCss ? css.styles : css
        const cssToInsert = isPostCss ? css.styles : transformCss(css, kremlingSelector)

        styleElement = document.createElement('style')
        styleElement.type = 'text/css'
        styleElement.textContent = cssToInsert
        styleElement.kremlings = 1
        styleElement.kremlingAttr = kremlingAttrName
        styleElement.kremlingValue = newKremlingId
        document.head.appendChild(styleElement)

        styleTags[rawCss] = styleElement

        setKremlingId(newKremlingId)

        return () => {
          if (--styleElement.kremlings === 0) {
            document.head.removeChild(styleElement)
            delete styleTags[css]
          }
        }
      }
    }, [css, namespace, kremlingAttrName])
  }
}
