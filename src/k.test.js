import { k } from './k';

describe('k', () => {
  test(`should literally do nothing`, () => {
    const styles = `.test { background-color: red; };`;
    expect(k`${styles}`).toEqual(styles);
  });

  test(`should handle nested placeholders`, () => {
    const styles = `.test {
      background-color: ${k ? 'red' : `${'blue' || 'green'}`}
    }`;
    expect(k`${styles}`).toEqual(styles);
  });
});