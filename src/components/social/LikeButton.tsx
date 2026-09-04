"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLikePostAction, toggleLikeCommentAction } from "@/actions/social";
import { cx, formatCount } from "@/lib/utils";
import Toast from "@/components/ui/Toast";

type Props =
  | { target: "post"; postId: string; initialLiked: boolean; initialCount: number; isAuthenticated: boolean }
  | {
      target: "comment";
      commentId: string;
      postId: string;
      initialLiked: boolean;
      initialCount: number;
      isAuthenticated: boolean;
    };

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(props.initialLiked);
  const [count, setCount] = useState(props.initialCount);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const [pop, setPop] = useState(false);

  function handleClick() {
    if (!props.isAuthenticated) {
      setNotice("Connectez-vous pour continuer");
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }

    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    if (next) {
      setPop(true);
      window.setTimeout(() => setPop(false), 400);
    }

    startTransition(async () => {
      const result =
        props.target === "post"
          ? await toggleLikePostAction(props.postId, next)
          : await toggleLikeCommentAction(props.commentId, props.postId, next);

      if (!result.ok) {
        setLiked(!next);
        setCount((c) => c - (next ? 1 : -1));
        setNotice(result.message ?? "Une erreur est survenue.");
        window.setTimeout(() => setNotice(null), 2200);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={liked}
        aria-label={liked ? "Retirer le like" : "Aimer"}
        className={cx(
          "focus-ring transition-platform flex min-h-[40px] items-center gap-2 rounded-full px-2 font-sans text-body-md",
          liked ? "text-signal" : "text-muted hover:text-ink"
        )}
      >
        <Heart
          size={18}
          strokeWidth={1.75}
          className={cx(liked && "fill-signal", pop && "animate-pop-heart")}
        />
        <span className="tabular-nums">{formatCount(count)}</span>
      </button>
      <Toast message={notice} />
    </div>
  );
}
