import { forwardRef } from "react";
import { cx } from "@/lib/utils";

const fieldStyles =
  "focus-ring transition-platform w-full rounded-md bg-surface px-3.5 py-2.5 font-sans text-body-md text-ink shadow-[inset_0_0_0_1px_rgb(24_24_31_/_0.04)] placeholder:text-muted hover:bg-surface-sunken";

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cx(fieldStyles, className)} {...props} />
);
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cx(fieldStyles, "resize-none", className)} {...props} />
  )
);
TextArea.displayName = "TextArea";

/** Label + champ + espace d'erreur, pour garder des formulaires cohérents et accessibles. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 block font-sans text-body-sm font-medium text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block font-sans text-body-sm text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block font-sans text-body-sm text-signal">
          {error}
        </span>
      )}
    </label>
  );
}
