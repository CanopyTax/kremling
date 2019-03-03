export = Kremling

declare namespace Kremling {
  function useCss(css: string): Scope;
  function always(className: string): KremlingString;
  function a(className: string): KremlingString;
  function maybe(className: string, condition: any): KremlingString;
  function m(className: string, condition: any): KremlingString;
  function toggle(truthyClass: string, falsyClass: string, condition: any): KremlingString;
  function t(truthyClass: string, falsyClass: string, condition: any): KremlingString;

  interface KremlingString extends String {
    always(className: string): KremlingString,
    a(className: string): KremlingString,
    maybe(className: string, condition: any): KremlingString,
    m(className: string, condition: any): KremlingString,
    toggle(truthyClass: string, falsyClass: string, condition: any): KremlingString,
    t(truthyClass: string, falsyClass: string, condition: any): KremlingString,
    toString(): string,
  }

  type Scope = {
    'data-kremling': string,
  }
}