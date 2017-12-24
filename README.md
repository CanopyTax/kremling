# kremling
[![npm version](https://img.shields.io/npm/v/kremling.svg?style=flat-square)](https://www.npmjs.org/package/kremling)
[![Build Status](https://img.shields.io/travis/CanopyTax/kremling/master.svg?style=flat-square)](https://travis-ci.org/CanopyTax/kremling)

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
import { Scoped, always, maybe } from "kremling";

const css = `
  & .card {
    display: flex;
    color: #BADA55;
  }

  & .fear {
    display: none;
  }
`;

class KremlingKrew extends React.Component {
  state = { gotBananas: true };

  render() {
    return (
      <div>
        <Scoped css={css}>
          <div className="card">King K. Rool</div>
          <div className={always("card").maybe("fear", this.gotBananas)}>
            DK
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

`Scoped` - A React Component which requires a `css` prop. The
  CSS rules defined in that property will be avaible only to children
  of the rendered `Scoped` Component. Scoped CSS rules must begin
  with an `&`.

  The `Scoped` Component optionally takes a `namespace` prop which
  defines a custom namespace for scoping your CSS.

`always(String)` or `a(String)` - Always return the string passes.

`maybe(String, Boolean)` or `m(String, Boolean)` - Conditionally return the String depending on if the second parameter is truthy.
