"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveAction } from "@/actions/social";
import { cx } from "@/lib/utils";
import Toast from "@/components/ui/Toast";

export default function SaveButton({
  postId,
  initialSaved,
  isAuthenticated
}: {
  postId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  function handleClick() {
    if (!isAuthenticated) {
      setNotice("Connectez-vous pour continuer");
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSaveAction(postId, next);
      if (!result.ok) setSaved(!next);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={saved}
        aria-label={saved ? "Retirer des sauvegardes" : "Enregistrer"}
        className={cx(
          "focus-ring transition-platform flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full",
          saved ? "text-ink" : "text-muted hover:text-ink"
        )}
      >
        <Bookmark size={18} strokeWidth={1.75} className={cx(saved && "fill-ink")} />
      </button>
      <Toast message={notice} align="right" />
    </div>
  );
}
