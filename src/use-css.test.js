import React from 'react'
import ReactDOM from 'react-dom'
import {act} from 'react-dom/test-utils'
import {useCss} from './use-css.hook.js'
import {resetState, styleTags} from './style-element-utils.js'

let numRenders = 0

describe('useCss()', () => {
  let container

  beforeEach(() => {
    resetState()
    container = document.createElement('div')
    numRenders = 0
    const styleElements = document.querySelectorAll('style')
    Array.prototype.slice.call(document.querySelectorAll('style')).forEach(styleElement => {
      styleElement.remove()
    })
  })

  it('returns the correct props for a dom react element', () => {
    const css = `& .foo {}`

    ReactDOM.render(<ScopedDiv css={css} />, container)
    expect(container.innerHTML).toEqual('<div data-kremling="0"></div>')
    ReactDOM.unmountComponentAtNode(container)
  })

  it('creates a <style> element when mounting new css, and removes the <style> element when unmounting the component', () => {
    const css = `& .foo {}`

    act(() => {
      ReactDOM.render(<ScopedDiv css={css} />, container)
    })
    const styleElement = document.querySelector('style')
    expect(styleElement).not.toBeUndefined()
    expect(styleElement.textContent).toEqual(`[data-kremling='0'] .foo, [data-kremling='0'].foo {}`)
    expect(styleElement.isConnected).toBe(true)
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
    expect(styleElement.isConnected).toBe(false)
  })

  it('reuses an existing style element from a different instance or component', () => {
    const css = `& .foo {}`
    const existingStyleElement = document.createElement('style')
    existingStyleElement.type = 'text/css'
    existingStyleElement.textContent = `[data-kremling='4'] .foo, [data-kremling='4'].foo {}`
    existingStyleElement.kremlings = 1
    existingStyleElement.kremlingAttr = 'data-kremling'
    existingStyleElement.kremlingValue = 4
    document.head.appendChild(existingStyleElement)
    styleTags[css] = existingStyleElement

    act(() => {
      ReactDOM.render(<ScopedDiv css={css} />, container)
    })
    expect(document.querySelectorAll('style').length).toBe(1)
    expect(document.querySelector('style')).toBe(existingStyleElement)
    expect(container.innerHTML).toEqual('<div data-kremling="4"></div>')
    // The style element is in the dom
    expect(existingStyleElement.isConnected).toBe(true)
    expect(existingStyleElement.kremlings).toBe(2)

    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
    // The style element is still in the dom because there was a previous thing using it
    expect(existingStyleElement.isConnected).toBe(true)
    expect(existingStyleElement.kremlings).toBe(1)
  })

  it(`doesn't cause the component to render more than once`, () => {
    const css = `& .foo {}`
    act(() => {
      ReactDOM.render(<ScopedDiv css={css} />, container)
    })
    expect(numRenders).toBe(1)
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })

  it(`doesn't do anything weird on subsequent renders`, () => {
    const css = `& .foo {}`
    act(() => {
      ReactDOM.render(<ScopedDiv css={css} />, container)
    })
    expect(document.querySelectorAll('style').length).toBe(1)
    let styleElement = document.querySelector('style')
    expect(styleElement.kremlings).toBe(1)
    expect(styleElement.kremlingAttr).toBe('data-kremling')
    expect(styleElement.kremlingValue).toBe(0)

    // Subsequent render
    act(() => {
      ReactDOM.render(<ScopedDiv css={css} />, container)
    })
    expect(document.querySelectorAll('style').length).toBe(1)
    styleElement = document.querySelector('style')
    expect(styleElement.kremlings).toBe(1)
    expect(styleElement.kremlingAttr).toBe('data-kremling')
    expect(styleElement.kremlingValue).toBe(0)

    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })

  it(`allows you to change the dom attribute with a namespace argument`, () => {
    const css = `& .foo {}`

    act(() => {
      ReactDOM.render(<ScopedDiv css={css} namespace="yoshi" />, container)
    })
    expect(container.innerHTML).toEqual('<div data-yoshi="0"></div>')
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })

  it(`works with postcss`, () => {
    const postcss = {
      id: '15',
      styles: `[donkey-kong='15'] .foo, [donkey-kong='15'].foo {}`,
      namespace: 'donkey-kong',
    }

    act(() => {
      ReactDOM.render(<ScopedDiv css={postcss} />, container)
    })
    expect(container.innerHTML).toEqual('<div donkey-kong="15"></div>')
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })
})

function ScopedDiv(props) {
  const scope = useCss(props.css, props.namespace)

  numRenders++

  return (
    <div {...scope} />
  )
}
