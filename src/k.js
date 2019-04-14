export const k = (strings, ...args) => {
  const evalString = strings.map((item, i) => {
    return `${item}${args[i] || ''}`;
  }).join('');

  const [id, namespace, styles] = evalString.split('||KREMLING||');
  if (id && namespace && styles) {
    return { id, namespace, styles };
  }
  return evalString;
}