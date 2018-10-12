# kremling
[![npm version](https://img.shields.io/npm/v/kremling.svg?style=flat-square)](https://www.npmjs.org/package/kremling)
[![Build Status](https://img.shields.io/travis/CanopyTax/kremling/master.svg?style=flat-square)](https://travis-ci.org/CanopyTax/kremling)
[![Code
Coverage](https://img.shields.io/codecov/c/github/CanopyTax/kremling.svg?style=flat-square)](https://codecov.io/github/CanopyTax/kremling)

Embarrassingly simple css for React

## Why another CSS framework?

1. Kremling embraces the cascading nature of stylesheets while still
   allowing you to have scoped CSS. It allows you to define scoped
   styles that override global (or parent scoped) rules.
2. Kremling does not create unnecessary layers of React components
   throughout the DOM tree that show up in React Dev Tools.
3. Kremling cleans up after itself. Once components are removed from
   DOM, Kremling will remove the associate style tag.
4. Simple chained API for conditional CSS classes

## Setup
`yarn add kremling`

## Usage

### Scoped CSS
```js
import React from "react";
import { Scoped, always, maybe, toggle } from "kremling";

const css = `
  & .card {
    display: flex;
    color: #BADA55;
  }

  & .fear {
    background-color: red;
  }

  & .fight {
    font-weight: bold;
  }

  & .flight {
    font-style: italic;
  }
`;

class KremlingKrew extends React.Component {
  state = { gotBananas: true };

  render() {
    return (
      <div>
        <Scoped css={css}>
          <div className="card">King K. Rool</div>
          <div className={always("card").maybe("fear", this.state.gotBananas)}>
            <span className={toggle("flight", "fight", this.state.gotBananas)}>
              DK
            </span>
          </div>
        </Scoped>
        <div className="card">
          {/** no styles applied because out of scope **/}
          Clump & Crunch
        </div>
      </div>
    );
  }
}
```

## API

## `<Scoped />`

A React Component which requires a `css` or `postcss` prop.
The CSS rules defined in either of these properties will be available only to children
of the rendered `Scoped` Component.

#### `css` prop {string}

Scoped CSS rules. All selectors must begin with an `&`. See above example.

#### `namespace` prop {string} *Optional*

Define a custom namespace for scoping your CSS.

#### `postcss` prop {object}

An object containing pre-processed css styles and an optional namespace.
Check out the [`kremling-loader`](https://www.npmjs.com/package/kremling-loader) to learn how to use this.

#### `always`
`always(String)` or `a(String)` - Always return the string passes.

#### `maybe`
`maybe(String, Boolean)` or `m(String, Boolean)` - Conditionally return the String depending on if the second parameter is truthy.

####`toggle`
`toggle(String, String, Boolean)` or `t(String, String, Boolean)` - Returns the first String if the third parameter is truthy or the second String if the third parameter is falsy.

## Usage in tests
#### Enzyme
If you're using at least enzyme@3.3.0, you can do `wrapper.find('.myKlass')` and it will work just fine, even if you are using `always().maybe()` inside of the className prop. Enzyme will be able to select the css classes, as of [this commit](https://github.com/airbnb/enzyme/pull/1450)
that was [released in enzyme@3.3.0](https://github.com/airbnb/enzyme/blob/master/CHANGELOG.md#330)

#### Snapshots
If you are using snapshots, I would recommend not snapshotting the entire css string passed to the Scoped component. So if you are rendering `<Scoped css={aLongCssString}><div /></Scoped>`, I would recommend
doing `expect(wrapper.find('div').toMatchSnapshot()` instead of `expect(wrapper).toMatchSnapshot()` so that your snapshots aren't gigantic and less useful. Additionally, in order to make sure that css classes that use
`always()`, `maybe()`, or `toggle()` are serialized correctly, you should install [jest-string-object-serializer](https://github.com/CanopyTax/jest-string-object-serializer) and then add that to your [snapshotSerializers config](https://jestjs.io/docs/en/configuration.html#snapshotserializers-array-string)
