function build(str, args) {
  return str.map((item, i) => {
    return `${item}${args[i] || ''}`;
  }).join('');
}

export const k = (strings, ...args) => {
  const [firstString, ...restOfStrings] = strings;
  const [id, namespace, styles] = firstString.split('||KREMLING||');
  if (!namespace) return build(strings, args);
  return {
    id,
    namespace,
    styles: build([styles, ...restOfStrings], args),
  };
}