import { forwardRef } from "react";
import { cx } from "@/lib/utils";

/**
 * Bouton icône seule. Garantit une cible tactile d'au moins 40px (WCAG 2.5.8)
 * même quand l'icône visuelle est plus petite, via le padding.
 */
const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cx(
        "focus-ring transition-platform flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full",
        active ? "text-ink" : "text-muted hover:bg-surface-sunken hover:text-ink",
        className
      )}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";

export default IconButton;
