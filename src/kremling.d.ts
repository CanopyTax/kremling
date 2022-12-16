import * as React from 'react';

export = Kremling;

declare namespace Kremling {
  // Kremling can handle getting passed an undefined value
  type ClassName = string | undefined;

  function useCss(css: string | object): Scope;
  function always(...className: ClassName[]): KremlingString & string;
  function a(...className: ClassName[]): KremlingString & string;
  function maybe(className: ClassName, condition: any): KremlingString & string;
  function m(className: ClassName, condition: any): KremlingString & string;
  function toggle(truthyClass: ClassName, falsyClass: ClassName, condition: any): KremlingString & string;
  function t(truthyClass: ClassName, falsyClass: ClassName, condition: any): KremlingString & string;
  function k(strings: TemplateStringsArray, ...args: Array<string>): object | string;

  interface KremlingString extends String {
    always(...className: ClassName[]): KremlingString & string,
    a(...className: ClassName[]): KremlingString & string,
    maybe(className: ClassName, condition: any): KremlingString & string,
    m(className: ClassName, condition: any): KremlingString & string,
    toggle(truthyClass: ClassName, falsyClass: ClassName, condition: any): KremlingString & string,
    t(truthyClass: ClassName, falsyClass: ClassName, condition: any): KremlingString & string,
    toString(): string,
  }

  interface ScopedProps {
    css: string | object;
    namespace?: string;
  }

  class Scoped extends React.Component<ScopedProps> {}

  type Scope = {
    'data-kremling': string,
  }
}
