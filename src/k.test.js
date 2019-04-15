import { k } from './k';

describe('k', () => {
  test(`if kremling separators are used, return an object (postcss)`, () => {
    const example = k`k1||KREMLING||kremling||KREMLING||[kremling=k1].test, .test [kremling=k1] { background-color: red; };`;
    expect(example).toEqual({
      id: 'k1',
      namespace: 'kremling',
      styles: '[kremling=k1].test, .test [kremling=k1] { background-color: red; };',
    });
  });

  test(`if no separators are found, return a string (css)`, () => {
    const example = k`&.test { background-color: red; }`
    expect(example).toEqual(example)
  });
});