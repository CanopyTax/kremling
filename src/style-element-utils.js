let counter = 0;

export const incrementCounter = () => counter++

// For tests
export function resetState() {
  counter = 0;
  styleTags = {}
}

export let styleTags = {}

export function transformCss(css, kremlingSelector) {
  return css.replace(/& ([^{}])+{/g, (match, cssRule) => {
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
}
