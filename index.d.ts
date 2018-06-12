import * as React from "react";

export as namespace Kremling;
export = Kremling;

declare namespace Kremling {

  export function css(args: any): void;

  export function always(args: any): chainify;
  export function a(args: any): chainify;

  export function maybe(className: string, enabled: boolean): chainify;
  export function m(className: string, enabled: boolean): chainify;

  export function toggle(className1: string, className2: string, enabled: boolean): chainify;
  export function t(className1: string, className2: string, enabled: boolean): chainify;

  declare namespace Scoped {
    interface Props {
      css: string;
      namespace?: string;
    }
  }

  declare function chainify(previousString: string, newString: string): string;

  export class Scoped extends React.Component<Kremling.Scoped.Props> {}

}
