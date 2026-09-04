import { Inbox } from "lucide-react";

/**
 * État vide. Traité comme une invitation à agir plutôt qu'un simple message
 * ("moments for direction, not mood") : icône discrète + titre + piste
 * d'action concrète quand elle existe.
 */
export default function EmptyState({
  title,
  hint
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
      <Inbox size={22} strokeWidth={1.5} className="text-line-strong" aria-hidden="true" />
      <p className="font-display text-headline-sm text-ink">{title}</p>
      {hint && <p className="max-w-xs font-sans text-body-md text-muted">{hint}</p>}
    </div>
  );
}
