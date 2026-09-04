import { forwardRef } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-card hover:bg-accent-hover hover:shadow-card-hover active:bg-accent-hover",
  secondary: "border border-line-strong bg-paper text-ink hover:border-ink/30 hover:bg-surface active:bg-surface",
  ghost: "text-muted hover:text-ink hover:bg-surface active:bg-surface",
  danger: "text-signal hover:bg-signal-soft active:bg-signal-soft"
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-body-sm font-semibold",
  md: "px-5 py-2.5 text-body-md font-semibold"
};

/**
 * Bouton d'action de l'interface. Centralise variantes, tailles, focus et
 * état désactivé pour garantir une cohérence visuelle sur toute l'app.
 */
const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ variant = "primary", size = "md", className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cx(
          "focus-ring transition-platform inline-flex items-center justify-center gap-2 rounded-md font-sans disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
