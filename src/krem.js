export function krem(strings, ...args) {
  const [namespace, id, ...rest] = args;
  const styles = strings.slice(2).map((item, i) => {
    return `${item}${rest[i] || ''}`;
  }).join('');
  return { styles, id, namespace };
}