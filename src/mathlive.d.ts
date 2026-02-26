import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          "virtual-keyboard-mode"?: "auto" | "manual" | "off";
          "math-virtual-keyboard-policy"?: "auto" | "manual" | "sandboxed";
          "read-only"?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
