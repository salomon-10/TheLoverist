"use client";

import { useState, useTransition } from "react";
import { Repeat2 } from "lucide-react";
import { toggleRepostAction } from "@/actions/social";
import { cx, formatCount } from "@/lib/utils";
import Toast from "@/components/ui/Toast";

export default function RepostButton({
  postId,
  initialReposted,
  initialCount,
  isAuthenticated
}: {
  postId: string;
  initialReposted: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}) {
  const [reposted, setReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  function handleClick() {
    if (!isAuthenticated) {
      setNotice("Connectez-vous pour continuer");
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }
    const next = !reposted;
    setReposted(next);
    setCount((c) => c + (next ? 1 : -1));
    setNotice(next ? "Republié" : null);
    if (next) window.setTimeout(() => setNotice(null), 1800);

    startTransition(async () => {
      const result = await toggleRepostAction(postId, next);
      if (!result.ok) {
        setReposted(!next);
        setCount((c) => c - (next ? 1 : -1));
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={reposted}
        aria-label={reposted ? "Annuler la republication" : "Republier"}
        className={cx(
          "focus-ring transition-platform flex min-h-[40px] items-center gap-2 rounded-full px-2 font-sans text-body-md",
          reposted ? "text-accent" : "text-muted hover:text-ink"
        )}
      >
        <Repeat2 size={18} strokeWidth={1.75} />
        <span className="tabular-nums">{formatCount(count)}</span>
      </button>
      <Toast message={notice} />
    </div>
  );
}
