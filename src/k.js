export function k(strings, ...args) {
  return strings.map((item, i) => {
    return `${item}${args[i] || ''}`;
  }).join('');
}