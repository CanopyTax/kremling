import { krem } from './krem';

describe('krem', () => {
  test(`should convert string to object`, () => {
    const namespace = 'kremling';
    const id = 'k1';
    const styles = '[kremling=k1].test, .test [kremling=k1] { background-color: red; };';
    const example = krem`${namespace}${id}${styles}`;
    expect(example).toEqual({ id, namespace, styles });
  });

  test(`should handle extra placeholders`, () => {
    const namespace = 'kremling';
    const id = 'k1';
    const example = krem`${namespace}${id}[kremling=k1].test, .test [kremling=k1] { background-color: ${id ? 'red' : 'blue'}; };`;
    expect(example).toEqual({
      id,
      namespace,
      styles: '[kremling=k1].test, .test [kremling=k1] { background-color: red; };'
    })
  });
});