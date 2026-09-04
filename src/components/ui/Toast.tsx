import { cx } from "@/lib/utils";

/**
 * Bulle de notification contextuelle, ancrée à côté du contrôle qui l'a
 * déclenchée (ex : "Connectez-vous pour continuer" sous un bouton like).
 *
 * `role="status"` + `aria-live="polite"` garantissent qu'un lecteur d'écran
 * annonce le message même si l'utilisateur n'a pas le focus dessus —
 * auparavant ces messages étaient purement visuels.
 */
export default function Toast({
  message,
  align = "center"
}: {
  message: string | null;
  align?: "center" | "left" | "right";
}) {
  if (!message) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cx(
        "animate-toast-in absolute top-full z-10 mt-1.5 whitespace-nowrap rounded-lg border border-line bg-ink px-3 py-2 font-sans text-body-sm text-paper shadow-float",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "left" && "left-0",
        align === "right" && "right-0"
      )}
    >
      {message}
    </span>
  );
}
