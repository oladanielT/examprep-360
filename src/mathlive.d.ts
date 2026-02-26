import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "virtual-keyboard-mode"?: "auto" | "manual" | "off";
          "math-virtual-keyboard-policy"?: "auto" | "manual" | "sandboxed";
          "read-only"?: boolean;
        },
        HTMLElement
      >;
    }
  }
}
