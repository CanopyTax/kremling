# kremling
[![npm version](https://img.shields.io/npm/v/kremling.svg?style=flat-square)](https://www.npmjs.org/package/kremling)
[![Build Status](https://img.shields.io/travis/CanopyTax/kremling/master.svg?style=flat-square)](https://travis-ci.org/CanopyTax/kremling)

https://kremling.js.org


Kremling is an npm library for writing CSS with React. It uses [React hooks](https://reactjs.org/hooks), is only 4kb gzipped, and requires no changes to your webpack config or build process.

[Kremling Github page](https://github.com/CanopyTax/kremling)

[Walkthrough](walkthrough/getting-started.html)

## Motivation

Here are the principles behind Kremling's CSS.

1.  [**Scoped CSS**](concepts/scoped-css.html). Have CSS rules apply to a component and its children, but no other components. Allow for cascading rules within a "scope".
2.  **Make it easy to [conditionally apply CSS](walkthrough/conditional-css.html)**. We can do better than ternaries for changing a dom element's CSS classes.
3.  **Remove unused CSS from the DOM**. When there are no more components that are using a CSS class, the `<style>` element for those components should be removed from the DOM.
4.  **Readable class names**. In your browser dev tools, `<div class="card">` is easier to understand than `<div class="23fgh_es56_card">`.

## Hooks example

    import {useCss} from 'kremling'

    function MyComponent() {
      const scope = useCss(css)

      return (
        <div className="container" {...scope}>
          <button className="big-button">
            A big button
          </button>
        </div>
      )
    }

    const css = `
    /* your CSS classes are scoped for this component and its children components */
    & .container {
      border: 1px solid lightgray;
    }

    & .big-button {
      width: 40px;
      height: 60px;
    }
    `

## Class component example

    import {Scoped} from 'kremling'

    class AnotherComponent extends React.Component {
      render() {
        return (
          <Scoped css={css}>
            <div className="container">
              <button className="big-button">
                A big button
              </button>
            </div>
          </Scoped>
        )
      }
    }

    const css = `
    & .container {
      border: 1px solid lightgray;
    }

    & .big-button {
      width: 40px;
      height: 60px;
    }
    `

## Conditional CSS

    import {always, maybe} from 'kremling'

    function ClickHere(props) {
      return (
        <button
          className={always('click-here').maybe('already-clicked', props.wasClicked)}
          onClick={() => props.setWasClicked(true)}
        >
          Click here
        </button>
      )
    }

## Separate CSS file

    // foo.js
    import {useCss} from 'kremling'
    import css from './foo.css'

    function Foo(props) {
      const scope = useCss(css)

      return (
        <span {...scope} className="foo">
          Hello
        </span>
      )
    }

    /* foo.css */
    .foo {
      color: lawngreen;
    }


