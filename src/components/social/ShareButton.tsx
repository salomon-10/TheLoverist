"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // l'utilisateur a annulé — on retombe sur la copie du lien
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Partager"
        className="focus-ring transition-platform flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-muted hover:text-ink"
      >
        <Share size={17} strokeWidth={1.75} />
      </button>
      <Toast message={copied ? "Lien copié" : null} align="right" />
    </div>
  );
}
