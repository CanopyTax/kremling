import * as React from 'react';

export = Kremling;

declare namespace Kremling {
  function useCss(css: string | object): Scope;
  function always(className: string): KremlingString & string;
  function a(className: string): KremlingString & string;
  function maybe(className: string, condition: any): KremlingString & string;
  function m(className: string, condition: any): KremlingString & string;
  function toggle(truthyClass: string, falsyClass: string, condition: any): KremlingString & string;
  function t(truthyClass: string, falsyClass: string, condition: any): KremlingString & string;
  function k(strings: Array<string>, ...args: Array<string>): object | string;

  interface KremlingString extends String {
    always(className: string): KremlingString & string,
    a(className: string): KremlingString & string,
    maybe(className: string, condition: any): KremlingString & string,
    m(className: string, condition: any): KremlingString & string,
    toggle(truthyClass: string, falsyClass: string, condition: any): KremlingString & string,
    t(truthyClass: string, falsyClass: string, condition: any): KremlingString & string,
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