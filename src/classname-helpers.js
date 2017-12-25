export function css(...args) {
}

export function always(...args) {
  return chainify(this, args.join(' '));
}

export function maybe(className, enabled) {
  if (typeof className !== 'string') {
    throw new Error('kremling maybe() must be called with a string className and a boolean expression');
  }
  return chainify(this, enabled ? className : '');
}

function chainify(previousString, newString) {
  const existing = previousString instanceof String ? previousString.toString() : '';
  const str = new String([existing, newString].join(' ').trim());
  str.css = css.bind(str);
  str.c = str.css;
  str.always = always.bind(str);
  str.a = str.always;
  str.maybe = maybe.bind(str);
  str.m = str.maybe;
  return str;
}
