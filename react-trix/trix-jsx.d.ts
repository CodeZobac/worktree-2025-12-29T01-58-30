/**
 * Global type declarations for Trix editor custom elements
 * This file augments the JSX.IntrinsicElements interface to include
 * trix-editor and trix-toolbar custom elements.
 */

import type { DetailedHTMLProps, HTMLAttributes } from "react";

interface TrixEditorElementAttributes {
  toolbar?: string;
  input?: string;
  autofocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "trix-editor": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & TrixEditorElementAttributes,
        HTMLElement
      >;
      "trix-toolbar": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { id?: string },
        HTMLElement
      >;
    }
  }
}

export {};
